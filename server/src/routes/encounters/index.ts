import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import prisma from "../../services/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/errors";
import { requireEncounterDM } from "../../utils/accessControl";
import { pickDefined, trimOrNull } from "../../utils/payload";
import type {
  UpdateEncounterPayload,
  CreateParticipantPayload,
  UpdateParticipantPayload,
  BulkInitiativePayload,
  BulkCreateParticipantsPayload,
} from "../../../../shared/session";
import { getIo } from "../../services/socket";
import {
  jsonInput,
  mapEncounterToDTO,
  mapParticipantToDTO,
} from "./encounterMappers";
import {
  broadcastInitiative,
  broadcastParticipantUpdate,
} from "./encounterBroadcasts";

const router = Router();

router.post('/', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { campaignSessionId, name } = req.body;

  if (!campaignSessionId) {
    throw new AppError(400, 'campaignSessionId is required');
  }

  const session = await prisma.campaignSession.findUnique({
    where: { id: campaignSessionId, campaign: { dmId: userId } },
    select: { id: true, campaignId: true },
  });

  if (!session) {
    throw new AppError(404, 'Session not found');
  }

  const encounter = await prisma.encounter.create({
    data: {
      campaignSessionId,
      ...pickDefined({ name: trimOrNull(name) }),
    },
    include: { participants: true },
  });

  res.json({ status: 'ok', message: 'Encounter created', encounter });

  try {
    getIo()
      .to(`campaign:${session.campaignId}`)
      .emit('encounter_updated', { campaignId: session.campaignId, encounter: mapEncounterToDTO(encounter) });
  } catch (error) {
    console.error('encounter_updated broadcast failed', error);
  }
}));

router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const campaignSessionId = req.query.campaignSessionId as string | undefined;

  if (!campaignSessionId) {
    throw new AppError(400, 'campaignSessionId query param is required');
  }

  const session = await prisma.campaignSession.findUnique({
    where: {
      id: campaignSessionId,
      campaign: { members: { some: { userId } } },
    },
    include: { campaign: { select: { dmId: true } } },
  });

  if (!session) {
    throw new AppError(404, 'Session not found');
  }

  const isDM = session.campaign.dmId === userId;

  const encounters = await prisma.encounter.findMany({
    where: { campaignSessionId },
    include: { participants: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { startedAt: 'desc' },
  });

  const encountersForUser = isDM
    ? encounters
    : encounters.map((encounter) => ({
      ...encounter,
      participants: encounter.participants.filter((p) => p.isVisible),
    }));

  res.json({ status: 'ok', encounters: encountersForUser });
}));

router.get<{ id: string }>('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { id } = req.params;

  const encounter = await prisma.encounter.findUnique({
    where: {
      id,
      campaignSession: { campaign: { members: { some: { userId } } } },
    },
    include: {
      campaignSession: { select: { campaign: { select: { dmId: true } } } },
      participants: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!encounter) {
    throw new AppError(404, 'Encounter not found');
  }

  const { campaignSession, participants, ...fields } = encounter;
  const isDM = campaignSession.campaign.dmId === userId;
  const participantsForUser = isDM ? participants : participants.filter((p) => p.isVisible);

  res.json({ status: 'ok', encounter: { ...fields, participants: participantsForUser } });
}));

router.patch<{ id: string }>('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { id } = req.params;
  const { status, name } = req.body as UpdateEncounterPayload;

  const access = await requireEncounterDM(userId, id);

  const encounter = await prisma.encounter.update({
    where: { id },
    data: {
      ...pickDefined({
        status,
        name: trimOrNull(name),
      }),
      ...(status === 'ended' && { endedAt: new Date() }),
    },
  });

  res.json({ status: 'ok', encounter });

  try {
    const campaignId = access.campaignSession.campaign.id;
    getIo()
      .to(`campaign:${campaignId}`)
      .emit('encounter_updated', { campaignId, encounter: mapEncounterToDTO(encounter) });
  } catch (error) {
    console.error('encounter_updated broadcast failed', error);
  }
}));

router.delete<{ id: string }>('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { id } = req.params;

  await requireEncounterDM(userId, id);
  await prisma.encounter.delete({ where: { id } });

  res.json({ status: 'ok', message: 'Encounter deleted' });
}));

router.post<{ id: string }>('/:id/next-turn', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { id } = req.params;

  const encounter = await requireEncounterDM(userId, id);
  const total = await prisma.encounterParticipant.count({ where: { encounterId: id } });

  if (total === 0) {
    throw new AppError(400, 'No participants in encounter');
  }

  const next = encounter.currentTurnIndex + 1;
  const wraps = next >= total;
  const newIndex = wraps ? 0 : next;
  const newRound = wraps ? encounter.round + 1 : encounter.round;

  const updated = await prisma.encounter.update({
    where: { id },
    data: { currentTurnIndex: newIndex, round: newRound },
  });

  res.json({ status: 'ok', encounter: updated });

  try {
    const campaignId = encounter.campaignSession.campaign.id;
    getIo()
      .to(`campaign:${campaignId}`)
      .emit('encounter_updated', { campaignId, encounter: mapEncounterToDTO(updated) });
  } catch (error) {
    console.error('encounter_updated broadcast failed', error);
  }
}));

router.patch<{ id: string }>('/:id/initiative', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { id } = req.params;
  const { entries } = req.body as BulkInitiativePayload;

  if (!Array.isArray(entries) || entries.length === 0) {
    throw new AppError(400, 'entries array is required');
  }

  const access = await requireEncounterDM(userId, id);

  const ids = entries.map((e) => e.participantId);
  const owned = await prisma.encounterParticipant.findMany({
    where: { id: { in: ids }, encounterId: id },
    select: { id: true },
  });

  if (owned.length !== entries.length) {
    throw new AppError(400, 'Some participants do not belong to this encounter');
  }

  await prisma.$transaction(
    entries.map((e) =>
      prisma.encounterParticipant.update({
        where: { id: e.participantId },
        data: { sortOrder: e.sortOrder },
      })
    )
  );

  const participants = await prisma.encounterParticipant.findMany({
    where: { encounterId: id },
    orderBy: { sortOrder: 'asc' },
  });

  res.json({ status: 'ok', participants });

  try {
    const campaignId = access.campaignSession.campaign.id;
    const dmId = access.campaignSession.campaign.dmId;
    await broadcastInitiative(campaignId, dmId, id, participants.map(mapParticipantToDTO));
  } catch (error) {
    console.error('initiative_updated broadcast failed', error);
  }
}));

router.post<{ id: string }>('/:id/participants', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { id } = req.params;
  const body = req.body as CreateParticipantPayload;

  if (
    !body.type ||
    !body.name ||
    body.sortOrder === undefined ||
    body.maxHp === undefined ||
    body.currentHp === undefined ||
    body.armorClass === undefined
  ) {
    throw new AppError(400, 'type, name, sortOrder, maxHp, currentHp, armorClass are required');
  }

  await requireEncounterDM(userId, id);

  const participant = await prisma.encounterParticipant.create({
    data: {
      encounterId: id,
      type: body.type,
      name: body.name,
      sortOrder: body.sortOrder,
      maxHp: body.maxHp,
      currentHp: body.currentHp,
      armorClass: body.armorClass,
      ...pickDefined({
        characterId: body.characterId,
        tempHp: body.tempHp,
        conditions: body.conditions,
        isVisible: body.isVisible,
        attacks: body.attacks,
        acHidden: body.acHidden,
        typeHidden: body.typeHidden,
        spellAbility: body.spellAbility,
        proficiencyBonus: body.proficiencyBonus,
        abilityScores: jsonInput(body.abilityScores),
        spellSlots: jsonInput(body.spellSlots),
      }),
    },
  });

  res.json({ status: 'ok', participant });
}));

router.post<{ id: string }>('/:id/participants/bulk', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { id } = req.params;
  const { participants } = req.body as BulkCreateParticipantsPayload;

  if (!Array.isArray(participants) || participants.length === 0) {
    throw new AppError(400, 'participants array is required');
  }

  for (const p of participants) {
    if (
      !p.type ||
      !p.name ||
      p.sortOrder === undefined ||
      p.maxHp === undefined ||
      p.currentHp === undefined ||
      p.armorClass === undefined
    ) {
      throw new AppError(400, 'Each participant requires type, name, sortOrder, maxHp, currentHp, armorClass');
    }
  }

  await requireEncounterDM(userId, id);

  const created = await prisma.encounterParticipant.createManyAndReturn({
    data: participants.map((p) => ({
      encounterId: id,
      type: p.type,
      name: p.name,
      sortOrder: p.sortOrder,
      maxHp: p.maxHp,
      currentHp: p.currentHp,
      armorClass: p.armorClass,
      ...pickDefined({
        characterId: p.characterId,
        tempHp: p.tempHp,
        conditions: p.conditions,
        isVisible: p.isVisible,
        attacks: p.attacks,
        acHidden: p.acHidden,
        typeHidden: p.typeHidden,
        spellAbility: p.spellAbility,
        proficiencyBonus: p.proficiencyBonus,
        abilityScores: jsonInput(p.abilityScores),
        spellSlots: jsonInput(p.spellSlots),
      }),
    })),
  });

  res.json({ status: 'ok', participants: created });
}));

router.patch<{ id: string; pid: string }>('/:id/participants/:pid', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { id, pid } = req.params;
  const body = req.body as UpdateParticipantPayload;

  const participant = await prisma.encounterParticipant.findUnique({
    where: { id: pid },
    include: {
      character: { select: { userId: true } },
      encounter: {
        select: {
          id: true,
          campaignSession: { select: { campaign: { select: { id: true, dmId: true } } } },
        },
      },
    },
  });

  if (!participant || participant.encounterId !== id) {
    throw new AppError(404, 'Participant not found');
  }

  const isDM = participant.encounter.campaignSession.campaign.dmId === userId;
  const isOwner = participant.character?.userId === userId;

  if (!isDM && !isOwner) {
    throw new AppError(403, 'You can only modify your own character or as DM');
  }

  const wasVisible = participant.isVisible;

  const dmOnlyFields = isDM
    ? {
      name: body.name,
      maxHp: body.maxHp,
      armorClass: body.armorClass,
      attacks: body.attacks,
      isVisible: body.isVisible,
      acHidden: body.acHidden,
      typeHidden: body.typeHidden,
      spellAbility: body.spellAbility,
      proficiencyBonus: body.proficiencyBonus,
      abilityScores: jsonInput(body.abilityScores),
      spellSlots: jsonInput(body.spellSlots),
    }
    : {};

  const data = pickDefined({
    currentHp: body.currentHp,
    tempHp: body.tempHp,
    conditions: body.conditions,
    deathSaveSuccesses: body.deathSaveSuccesses,
    deathSaveFailures: body.deathSaveFailures,
    sortOrder: body.sortOrder,
    ...dmOnlyFields,
  });

  const updated = await prisma.encounterParticipant.update({
    where: { id: pid },
    data,
  });

  res.json({ status: 'ok', participant: updated });

  try {
    const dmId = participant.encounter.campaignSession.campaign.dmId;
    const campaignId = participant.encounter.campaignSession.campaign.id;
    await broadcastParticipantUpdate(campaignId, dmId, id, mapParticipantToDTO(updated), wasVisible);
  } catch (error) {
    console.error('participant broadcast failed', error);
  }
}));

router.delete<{ id: string }>('/:id/participants', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { id } = req.params;
  const idsParam = req.query.ids as string | undefined;

  if (!idsParam) {
    throw new AppError(400, 'ids query param is required');
  }

  const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) {
    throw new AppError(400, 'ids query param is empty');
  }

  await requireEncounterDM(userId, id);

  const owned = await prisma.encounterParticipant.findMany({
    where: { id: { in: ids }, encounterId: id },
    select: { id: true },
  });

  if (owned.length !== ids.length) {
    throw new AppError(400, 'Some participants do not belong to this encounter');
  }

  await prisma.encounterParticipant.deleteMany({
    where: { id: { in: ids }, encounterId: id },
  });

  res.json({ status: 'ok', message: 'Participants deleted', deletedIds: ids });
}));

router.delete<{ id: string; pid: string }>('/:id/participants/:pid', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { id, pid } = req.params;

  await requireEncounterDM(userId, id);

  const participant = await prisma.encounterParticipant.findUnique({
    where: { id: pid },
    select: { encounterId: true },
  });

  if (!participant || participant.encounterId !== id) {
    throw new AppError(404, 'Participant not found');
  }

  await prisma.encounterParticipant.delete({ where: { id: pid } });

  res.json({ status: 'ok', message: 'Participant deleted' });
}));

export default router;
