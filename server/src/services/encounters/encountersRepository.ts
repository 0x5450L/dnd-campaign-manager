import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { jsonInput, pickDefined, trimOrNull } from "../../utils/payload";
import { getLevelFromXp, getProficiencyBonus } from "../../../../shared/utils/dndMath";
import type {
  BulkInitiativeEntry,
  CreateParticipantPayload,
} from "../../../../shared/dto/session";

const bySortOrder = { sortOrder: "asc" } as const;

export const findOwnedSession = (campaignSessionId: string, userId: string) =>
  prisma.campaignSession.findUnique({
    where: { id: campaignSessionId, campaign: { dmId: userId } },
    select: { id: true, campaignId: true },
  });

export const findMemberSession = (campaignSessionId: string, userId: string) =>
  prisma.campaignSession.findUnique({
    where: { id: campaignSessionId, campaign: { members: { some: { userId } } } },
    include: { campaign: { select: { dmId: true } } },
  });

export const createEncounter = (
  campaignSessionId: string,
  name: string | null | undefined,
) =>
  prisma.encounter.create({
    data: { campaignSessionId, ...pickDefined({ name: trimOrNull(name) }) },
  });

export const findEncounterWithParticipants = (id: string) =>
  prisma.encounter.findUniqueOrThrow({
    where: { id },
    include: { participants: { orderBy: bySortOrder } },
  });

export const listEncountersBySession = (campaignSessionId: string) =>
  prisma.encounter.findMany({
    where: { campaignSessionId },
    include: { participants: { orderBy: bySortOrder } },
    orderBy: { startedAt: "desc" },
  });

const encounterForMemberInclude = {
  campaignSession: { select: { campaign: { select: { dmId: true } } } },
  participants: { orderBy: bySortOrder },
} satisfies Prisma.EncounterInclude;

export type EncounterForMember = Prisma.EncounterGetPayload<{
  include: typeof encounterForMemberInclude;
}>;

export const findEncounterForMember = (
  id: string,
  userId: string,
): Promise<EncounterForMember | null> =>
  prisma.encounter.findUnique({
    where: { id, campaignSession: { campaign: { members: { some: { userId } } } } },
    include: encounterForMemberInclude,
  });

export const updateEncounter = (id: string, data: Prisma.EncounterUpdateInput) =>
  prisma.encounter.update({ where: { id }, data });

export const deleteEncounter = (id: string) =>
  prisma.encounter.delete({ where: { id } });

export const countParticipants = (encounterId: string) =>
  prisma.encounterParticipant.count({ where: { encounterId } });

export const findParticipantIds = (ids: string[], encounterId: string) =>
  prisma.encounterParticipant.findMany({
    where: { id: { in: ids }, encounterId },
    select: { id: true },
  });

export const reorderParticipants = (entries: BulkInitiativeEntry[]) =>
  prisma.$transaction(
    entries.map((entry) =>
      prisma.encounterParticipant.update({
        where: { id: entry.participantId },
        data: { sortOrder: entry.sortOrder },
      }),
    ),
  );

export const listParticipants = (encounterId: string) =>
  prisma.encounterParticipant.findMany({
    where: { encounterId },
    orderBy: bySortOrder,
  });

const buildParticipantCreateData = (
  encounterId: string,
  input: CreateParticipantPayload,
): Prisma.EncounterParticipantUncheckedCreateInput => ({
  encounterId,
  type: input.type,
  name: input.name,
  sortOrder: input.sortOrder,
  maxHp: input.maxHp,
  currentHp: input.currentHp,
  armorClass: input.armorClass,
  ...pickDefined({
    characterId: input.characterId,
    tempHp: input.tempHp,
    conditions: input.conditions,
    isVisible: input.isVisible,
    attacks: input.attacks,
    acHidden: input.acHidden,
    typeHidden: input.typeHidden,
    usesShield: input.usesShield,
    spellAbility: input.spellAbility,
    proficiencyBonus: input.proficiencyBonus,
    abilityScores: jsonInput(input.abilityScores),
    spellSlots: jsonInput(input.spellSlots),
    speed: trimOrNull(input.speed),
    senses: trimOrNull(input.senses),
    challengeRating: input.challengeRating,
    damageVulnerabilities: trimOrNull(input.damageVulnerabilities),
    damageResistances: trimOrNull(input.damageResistances),
    damageImmunities: trimOrNull(input.damageImmunities),
    conditionImmunities: trimOrNull(input.conditionImmunities),
    abilities: jsonInput(input.abilities),
    resources: jsonInput(input.resources),
  }),
});

export const createParticipant = (
  encounterId: string,
  input: CreateParticipantPayload,
) =>
  prisma.encounterParticipant.create({
    data: buildParticipantCreateData(encounterId, input),
  });

export const createParticipants = (
  encounterId: string,
  inputs: CreateParticipantPayload[],
) =>
  prisma.encounterParticipant.createManyAndReturn({
    data: inputs.map((input) => buildParticipantCreateData(encounterId, input)),
  });

const participantForEditInclude = {
  character: { select: { userId: true } },
  encounter: {
    select: {
      id: true,
      campaignSession: { select: { campaign: { select: { id: true, dmId: true } } } },
    },
  },
} satisfies Prisma.EncounterParticipantInclude;

export type ParticipantForEdit = Prisma.EncounterParticipantGetPayload<{
  include: typeof participantForEditInclude;
}>;

export const findParticipantForEdit = (
  pid: string,
): Promise<ParticipantForEdit | null> =>
  prisma.encounterParticipant.findUnique({
    where: { id: pid },
    include: participantForEditInclude,
  });

export const updateParticipant = (
  pid: string,
  data: Prisma.EncounterParticipantUpdateInput,
) => prisma.encounterParticipant.update({ where: { id: pid }, data });

export const findParticipantEncounter = (pid: string) =>
  prisma.encounterParticipant.findUnique({
    where: { id: pid },
    select: { encounterId: true },
  });

export const deleteParticipant = (pid: string) =>
  prisma.encounterParticipant.delete({ where: { id: pid } });

export const deleteParticipants = (ids: string[], encounterId: string) =>
  prisma.encounterParticipant.deleteMany({
    where: { id: { in: ids }, encounterId },
  });

export const seedPartyForEncounter = async (
  encounterId: string,
  campaignId: string,
) => {
  const characters = await prisma.character.findMany({
    where: { campaignId, type: "player" },
    include: { abilityScores: true, attacks: true },
  });

  if (characters.length === 0) return;

  await prisma.encounterParticipant.createMany({
    data: characters.map((character) => ({
      encounterId,
      characterId: character.id,
      type: "pc" as const,
      name: character.name,
      sortOrder: 0,
      maxHp: character.maxHp,
      currentHp: character.currentHp,
      tempHp: character.tempHp,
      armorClass: character.armorClass,
      usesShield: character.usesShield,
      deathSaveSuccesses: character.deathSaveSuccesses,
      deathSaveFailures: character.deathSaveFailures,
      proficiencyBonus: getProficiencyBonus(getLevelFromXp(character.experience)),
      abilityScores: character.abilityScores.map((a) => ({ name: a.name, score: a.score })),
      attacks: character.attacks.map((a) => ({
        id: a.id,
        name: a.name,
        damage: a.damage,
        attackBonus: a.attackBonus,
        notes: a.notes,
      })),
    })),
  });
};
