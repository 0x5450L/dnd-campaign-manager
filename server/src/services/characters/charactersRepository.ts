import { EncounterStatus, Prisma } from "@prisma/client";
import prisma from "../prisma";
import { jsonInput, pickDefined } from "../../utils/payload";
import {
  ABILITY_NAMES,
  DEFAULT_ABILITY_SCORE,
  SKILL_NAMES,
} from "../../constants/dnd";
import type {
  CreateCharacterPayload,
  CreatureProfileInput,
  UpdateCharacterPayload,
} from "@shared/dto/character";

const characterSheetInclude = {
  abilityScores: true,
  skills: true,
  attacks: true,
  creatureProfile: true,
} satisfies Prisma.CharacterInclude;

const creatureProfileScalars = (input: CreatureProfileInput) =>
  pickDefined({
    challengeRating: input.challengeRating,
    creatureType: input.creatureType,
  });

const creatureProfileCreate = (input: CreatureProfileInput) =>
  creatureProfileScalars(input);

const creatureProfileUpdate = (input: CreatureProfileInput) =>
  creatureProfileScalars(input);

const campaignAccessInclude = {
  campaign: {
    select: {
      dmId: true,
      members: { include: { user: { select: { email: true } } } },
    },
  },
} satisfies Prisma.CharacterInclude;

export type CharacterWithCampaignAccess = Prisma.CharacterGetPayload<{
  include: typeof campaignAccessInclude;
}>;

export const findCampaignForMember = (campaignId: string, userId: string) =>
  prisma.campaign.findUnique({
    where: { id: campaignId, members: { some: { userId } } },
    include: { members: { include: { user: { select: { email: true } } } } },
  });

export const createCharacter = (userId: string, input: CreateCharacterPayload) =>
  prisma.character.create({
    data: {
      name: input.name,
      type: input.type,
      race: input.race,
      characterClass: input.characterClass,
      background: input.background ?? "",
      campaignId: input.campaignId,
      userId,
      ...pickDefined({ alignment: input.alignment, notes: input.notes }),
      abilityScores: {
        create: ABILITY_NAMES.map((ability) => ({
          name: ability,
          score: DEFAULT_ABILITY_SCORE,
        })),
      },
      skills: {
        create: SKILL_NAMES.map((skillName) => ({ name: skillName })),
      },
      ...(input.creatureProfile !== undefined && {
        creatureProfile: { create: creatureProfileCreate(input.creatureProfile) },
      }),
    },
    include: characterSheetInclude,
  });

export const listCampaignCharacters = (campaignId: string) =>
  prisma.character.findMany({
    where: { campaignId },
    include: {
      user: { select: { id: true, displayName: true, email: true } },
    },
  });

export const findCharacterWithCampaignAccess = (
  id: string,
): Promise<CharacterWithCampaignAccess | null> =>
  prisma.character.findUnique({ where: { id }, include: campaignAccessInclude });

export const findActiveEncounter = (campaignId: string) =>
  prisma.encounter.findFirst({
    where: {
      status: EncounterStatus.active,
      campaignSession: { campaignId },
    },
    select: { id: true },
  });

export const updateCharacter = (id: string, input: UpdateCharacterPayload) =>
  prisma.character.update({
    where: { id },
    data: {
      ...pickDefined({
        name: input.name,
        type: input.type,
        race: input.race,
        characterClass: input.characterClass,
        background: input.background,
        alignment: input.alignment,
        notes: input.notes,
        experience: input.experience,
        speed: input.speed,
        hitDiceType: input.hitDiceType,
        hitDiceUsed: input.hitDiceUsed,
        maxHp: input.maxHp,
        currentHp: input.currentHp,
        tempHp: input.tempHp,
        deathSaveSuccesses: input.deathSaveSuccesses,
        deathSaveFailures: input.deathSaveFailures,
        armorClass: input.armorClass,
        usesShield: input.usesShield,
        inspiration: input.inspiration,
        size: input.size,
        senses: input.senses,
        languages: input.languages,
        damageVulnerabilities: input.damageVulnerabilities,
        damageResistances: input.damageResistances,
        damageImmunities: input.damageImmunities,
        conditionImmunities: input.conditionImmunities,
      }),
      ...(input.spellSlots !== undefined && {
        spellSlots: jsonInput(input.spellSlots),
      }),
      ...(input.abilities !== undefined && {
        abilities: jsonInput(input.abilities),
      }),
      ...(input.resources !== undefined && {
        resources: jsonInput(input.resources),
      }),
      ...(input.abilityScores !== undefined && input.abilityScores.length > 0 && {
        abilityScores: {
          updateMany: input.abilityScores.map((a) => ({
            where: { name: a.name },
            data: { score: a.score, saveThrowProficient: a.saveThrowProficient },
          })),
        },
      }),
      ...(input.skills !== undefined && input.skills.length > 0 && {
        skills: {
          updateMany: input.skills.map((s) => ({
            where: { name: s.name },
            data: { proficient: s.proficient },
          })),
        },
      }),
      ...(input.creatureProfile !== undefined && {
        creatureProfile: {
          upsert: {
            create: creatureProfileCreate(input.creatureProfile),
            update: creatureProfileUpdate(input.creatureProfile),
          },
        },
      }),
      ...(input.attacks !== undefined && {
        attacks:
          input.attacks.length === 0
            ? { deleteMany: {} }
            : {
                deleteMany: {},
                create: input.attacks.map((a) => ({
                  name: a.name,
                  damage: a.damage,
                  attackBonus: a.attackBonus,
                  notes: a.notes ?? null,
                })),
              },
      }),
    },
    include: characterSheetInclude,
  });

export const deleteCharacter = (id: string) =>
  prisma.character.delete({ where: { id } });

export const findCharacterForMember = (id: string, userId: string) =>
  prisma.character.findUnique({
    where: { id, campaign: { members: { some: { userId } } } },
    include: characterSheetInclude,
  });
