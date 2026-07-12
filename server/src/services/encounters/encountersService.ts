import { AppError } from "../../utils/errors";
import { requireEncounterDM } from "../../utils/accessControl";
import { jsonInput, pickDefined, trimOrNull } from "../../utils/payload";
import type {
  BulkInitiativePayload,
  BulkCreateParticipantsPayload,
  CreateParticipantPayload,
  UpdateEncounterPayload,
  UpdateParticipantPayload,
} from "../../../../shared/dto/session";
import type { Ability, AbilityUsageAction, ResourcePool } from "../../../../shared/types/abilities";
import type { InitiativeRollDTO, RollInitiativePayload } from "../../../../shared/dto/session";
import { rollInitiative } from "../../../../shared/utils/initiative";
import { applyAbilityUsage, applyTurnStart } from "../../../../shared/utils/abilityUsage";
import { rollDie } from "../../../../shared/utils/dice";
import * as encountersRepo from "./encountersRepository";
import { mapEncounterToDTO, mapParticipantToDTO } from "./encountersMappers";
import {
  broadcastEncounterUpdated,
  broadcastInitiative,
  broadcastParticipantRemoved,
  broadcastParticipantUpdate,
  broadcastTurnAdvanced,
} from "./encountersBroadcasts";
import {
  parseParticipantIds,
  requireCampaignSessionId,
  requireInitiativeEntries,
  requireParticipantFields,
  requireParticipantsPayload,
} from "./encountersValidation";

export const createEncounter = async (
  userId: string,
  campaignSessionId: string | undefined,
  name: string | undefined,
) => {
  requireCampaignSessionId(campaignSessionId, "campaignSessionId is required");

  const session = await encountersRepo.findOwnedSession(campaignSessionId!, userId);
  if (!session) {
    throw new AppError(404, "Session not found");
  }

  const encounter = await encountersRepo.createEncounter(campaignSessionId!, name);
  await encountersRepo.seedPartyForEncounter(encounter.id, session.campaignId);
  const created = await encountersRepo.findEncounterWithParticipants(encounter.id);

  try {
    broadcastEncounterUpdated(session.campaignId, mapEncounterToDTO(created));
  } catch (error) {
    console.error("encounter_updated broadcast failed", error);
  }

  return created;
};

export const listEncounters = async (
  userId: string,
  campaignSessionId: string | undefined,
) => {
  requireCampaignSessionId(campaignSessionId, "campaignSessionId query param is required");

  const session = await encountersRepo.findMemberSession(campaignSessionId!, userId);
  if (!session) {
    throw new AppError(404, "Session not found");
  }

  const isDM = session.campaign.dmId === userId;
  const encounters = await encountersRepo.listEncountersBySession(campaignSessionId!);

  if (isDM) {
    return encounters;
  }

  return encounters.map((encounter) => ({
    ...encounter,
    participants: encounter.participants.filter((participant) => participant.isVisible),
  }));
};

export const getEncounter = async (userId: string, id: string) => {
  const encounter = await encountersRepo.findEncounterForMember(id, userId);
  if (!encounter) {
    throw new AppError(404, "Encounter not found");
  }

  const { campaignSession, participants, ...fields } = encounter;
  const isDM = campaignSession.campaign.dmId === userId;
  const participantsForUser = isDM
    ? participants
    : participants.filter((participant) => participant.isVisible);

  return { ...fields, participants: participantsForUser };
};

export const updateEncounter = async (
  userId: string,
  id: string,
  body: UpdateEncounterPayload,
) => {
  const access = await requireEncounterDM(userId, id);

  const encounter = await encountersRepo.updateEncounter(id, {
    ...pickDefined({ status: body.status, name: trimOrNull(body.name) }),
    ...(body.status === "ended" && { endedAt: new Date() }),
  });

  try {
    broadcastEncounterUpdated(access.campaignSession.campaign.id, mapEncounterToDTO(encounter));
  } catch (error) {
    console.error("encounter_updated broadcast failed", error);
  }

  return encounter;
};

export const deleteEncounter = async (userId: string, id: string) => {
  await requireEncounterDM(userId, id);
  await encountersRepo.deleteEncounter(id);
};

export const advanceTurn = async (userId: string, id: string) => {
  const encounter = await requireEncounterDM(userId, id);
  const participants = await encountersRepo.listParticipants(id);
  const total = participants.length;

  if (total === 0) {
    throw new AppError(400, "No participants in encounter");
  }

  const next = encounter.currentTurnIndex + 1;
  const wraps = next >= total;
  const newIndex = wraps ? 0 : next;
  const active = participants[newIndex];

  const abilities = (active.abilities as unknown as Ability[] | null) ?? [];
  const resources = (active.resources as unknown as ResourcePool[] | null) ?? [];
  const turnStart = applyTurnStart(abilities, resources, () => rollDie(6));

  const encounterUpdate = encountersRepo.updateEncounter(id, {
    currentTurnIndex: newIndex,
    round: wraps ? encounter.round + 1 : encounter.round,
  });

  const [updated, updatedActive] = turnStart.changed
    ? await encountersRepo.runInTransaction([
        encounterUpdate,
        encountersRepo.updateParticipant(active.id, {
          abilities: jsonInput(turnStart.abilities),
          resources: jsonInput(turnStart.resources),
        }),
      ])
    : [await encounterUpdate, active];

  try {
    await broadcastTurnAdvanced(
      encounter.campaignSession.campaign.id,
      encounter.campaignSession.campaign.dmId,
      mapEncounterToDTO(updated),
      mapParticipantToDTO(updatedActive),
      turnStart.rechargeRolls,
    );
  } catch (error) {
    console.error("turn_advanced broadcast failed", error);
  }

  return updated;
};

export const setInitiative = async (
  userId: string,
  id: string,
  body: BulkInitiativePayload,
) => {
  const entries = requireInitiativeEntries(body.entries);
  const access = await requireEncounterDM(userId, id);

  const owned = await encountersRepo.findParticipantIds(
    entries.map((entry) => entry.participantId),
    id,
  );
  if (owned.length !== entries.length) {
    throw new AppError(400, "Some participants do not belong to this encounter");
  }

  await encountersRepo.reorderParticipants(entries);
  const participants = await encountersRepo.listParticipants(id);

  try {
    await broadcastInitiative(
      access.campaignSession.campaign.id,
      access.campaignSession.campaign.dmId,
      id,
      participants.map(mapParticipantToDTO),
    );
  } catch (error) {
    console.error("initiative_updated broadcast failed", error);
  }

  return participants;
};

const withRolledInitiative = (body: CreateParticipantPayload): CreateParticipantPayload =>
  body.sortOrder
    ? body
    : { ...body, sortOrder: rollInitiative(body.abilityScores ?? null).total };

export const addParticipant = async (
  userId: string,
  id: string,
  body: CreateParticipantPayload,
) => {
  requireParticipantFields(
    body,
    "type, name, sortOrder, maxHp, currentHp, armorClass are required",
  );
  const access = await requireEncounterDM(userId, id);
  const participant = await encountersRepo.createParticipant(id, withRolledInitiative(body));

  try {
    await broadcastParticipantUpdate(
      access.campaignSession.campaign.id,
      access.campaignSession.campaign.dmId,
      id,
      mapParticipantToDTO(participant),
      false,
    );
  } catch (error) {
    console.error("participant add broadcast failed", error);
  }

  return participant;
};

export const addParticipants = async (
  userId: string,
  id: string,
  body: BulkCreateParticipantsPayload,
) => {
  const participants = requireParticipantsPayload(body.participants);
  await requireEncounterDM(userId, id);
  return encountersRepo.createParticipants(id, participants.map(withRolledInitiative));
};

export const updateParticipant = async (
  userId: string,
  id: string,
  pid: string,
  body: UpdateParticipantPayload,
) => {
  const participant = await encountersRepo.findParticipantForEdit(pid);
  if (!participant || participant.encounterId !== id) {
    throw new AppError(404, "Participant not found");
  }

  const isDM = participant.encounter.campaignSession.campaign.dmId === userId;
  const isOwner = participant.character?.userId === userId;
  if (!isDM && !isOwner) {
    throw new AppError(403, "You can only modify your own character or as DM");
  }

  const wasVisible = participant.isVisible;

  const characterFields = isDM || isOwner
    ? {
        name: body.name,
        maxHp: body.maxHp,
        armorClass: body.armorClass,
        usesShield: body.usesShield,
        attacks: body.attacks,
        spellAbility: body.spellAbility,
        proficiencyBonus: body.proficiencyBonus,
        abilityScores: jsonInput(body.abilityScores),
        spellSlots: jsonInput(body.spellSlots),
        speed: body.speed,
        senses: body.senses,
        challengeRating: body.challengeRating,
        damageVulnerabilities: body.damageVulnerabilities,
        damageResistances: body.damageResistances,
        damageImmunities: body.damageImmunities,
        conditionImmunities: body.conditionImmunities,
        abilities: jsonInput(body.abilities),
        resources: jsonInput(body.resources),
      }
    : {};

  const dmOnlyFields = isDM
    ? {
        isVisible: body.isVisible,
        acHidden: body.acHidden,
        typeHidden: body.typeHidden,
      }
    : {};

  const data = pickDefined({
    currentHp: body.currentHp,
    tempHp: body.tempHp,
    conditions: body.conditions,
    deathSaveSuccesses: body.deathSaveSuccesses,
    deathSaveFailures: body.deathSaveFailures,
    sortOrder: body.sortOrder,
    ...characterFields,
    ...dmOnlyFields,
  });

  const updated = await encountersRepo.updateParticipant(pid, data);

  try {
    await broadcastParticipantUpdate(
      participant.encounter.campaignSession.campaign.id,
      participant.encounter.campaignSession.campaign.dmId,
      id,
      mapParticipantToDTO(updated),
      wasVisible,
    );
  } catch (error) {
    console.error("participant broadcast failed", error);
  }

  return updated;
};

export const rollEncounterInitiative = async (
  userId: string,
  id: string,
  body: RollInitiativePayload,
) => {
  const encounter = await encountersRepo.findEncounterForMember(id, userId);
  if (!encounter) {
    throw new AppError(404, "Encounter not found");
  }

  const isDM = encounter.campaignSession.campaign.dmId === userId;
  const participants = await encountersRepo.listParticipantsWithOwners(id);
  const requestedIds = body.participantIds?.filter(Boolean);
  const targets = requestedIds?.length
    ? participants.filter((participant) => requestedIds.includes(participant.id))
    : participants;

  if (requestedIds?.length && targets.length !== requestedIds.length) {
    throw new AppError(400, "Some participants do not belong to this encounter");
  }
  if (targets.length === 0) {
    throw new AppError(400, "No participants to roll initiative for");
  }
  if (!isDM && !targets.every((participant) => participant.character?.userId === userId)) {
    throw new AppError(403, "You can only roll initiative for your own character or as DM");
  }

  const rolls: InitiativeRollDTO[] = targets.map((participant) => {
    const scores = participant.abilityScores as unknown as
      | { name: string; score: number }[]
      | null;
    return {
      participantId: participant.id,
      participantName: participant.name,
      ...rollInitiative(scores),
    };
  });

  await encountersRepo.reorderParticipants(
    rolls.map((roll) => ({ participantId: roll.participantId, sortOrder: roll.total })),
  );
  const updated = await encountersRepo.listParticipants(id);

  try {
    await broadcastInitiative(
      encounter.campaignSession.campaign.id,
      encounter.campaignSession.campaign.dmId,
      id,
      updated.map(mapParticipantToDTO),
      rolls,
    );
  } catch (error) {
    console.error("initiative_updated broadcast failed", error);
  }

  return { participants: updated, rolls };
};

export const applyParticipantAbilityUsage = async (
  userId: string,
  id: string,
  pid: string,
  abilityId: string,
  action: AbilityUsageAction,
) => {
  if (action !== "spend" && action !== "restore") {
    throw new AppError(400, "Unknown ability usage action");
  }

  const participant = await encountersRepo.findParticipantForEdit(pid);
  if (!participant || participant.encounterId !== id) {
    throw new AppError(404, "Participant not found");
  }

  const isDM = participant.encounter.campaignSession.campaign.dmId === userId;
  const isOwner = participant.character?.userId === userId;
  if (!isDM && !isOwner) {
    throw new AppError(403, "You can only modify your own character or as DM");
  }

  const abilities = (participant.abilities as unknown as Ability[] | null) ?? [];
  const resources = (participant.resources as unknown as ResourcePool[] | null) ?? [];
  const result = applyAbilityUsage(abilities, resources, abilityId, action);
  if (!result) {
    throw new AppError(409, "Ability usage is not available");
  }

  const updated = await encountersRepo.updateParticipant(pid, {
    abilities: jsonInput(result.abilities),
    resources: jsonInput(result.resources),
  });

  try {
    await broadcastParticipantUpdate(
      participant.encounter.campaignSession.campaign.id,
      participant.encounter.campaignSession.campaign.dmId,
      id,
      mapParticipantToDTO(updated),
      participant.isVisible,
    );
  } catch (error) {
    console.error("participant broadcast failed", error);
  }

  return updated;
};

export const removeParticipants = async (
  userId: string,
  id: string,
  idsParam: string | undefined,
) => {
  const ids = parseParticipantIds(idsParam);
  await requireEncounterDM(userId, id);

  const owned = await encountersRepo.findParticipantIds(ids, id);
  if (owned.length !== ids.length) {
    throw new AppError(400, "Some participants do not belong to this encounter");
  }

  await encountersRepo.deleteParticipants(ids, id);
  return ids;
};

export const removeParticipant = async (
  userId: string,
  id: string,
  pid: string,
) => {
  const access = await requireEncounterDM(userId, id);

  const participant = await encountersRepo.findParticipantEncounter(pid);
  if (!participant || participant.encounterId !== id) {
    throw new AppError(404, "Participant not found");
  }

  await encountersRepo.deleteParticipant(pid);

  try {
    broadcastParticipantRemoved(access.campaignSession.campaign.id, id, pid);
  } catch (error) {
    console.error("participant_removed broadcast failed", error);
  }
};
