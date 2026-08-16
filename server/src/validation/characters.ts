import { z } from "zod";
import { TEXT_LIMITS } from "../constants/limits";
import type {
  CreateCharacterPayload,
  UpdateCharacterPayload,
} from "@dnd/shared/dto/character";
import {
  abilityNameSchema,
  abilitySchema,
  attackInputSchema,
  resourcePoolSchema,
  spellSlotSchema,
} from "./common";

const characterTypeSchema = z.enum(["player", "npc", "monster"]);

const alignmentSchema = z.enum([
  "lawful_good",
  "neutral_good",
  "chaotic_good",
  "lawful_neutral",
  "true_neutral",
  "chaotic_neutral",
  "lawful_evil",
  "neutral_evil",
  "chaotic_evil",
]);

const creatureProfileSchema = z.object({
  challengeRating: z.number().nullable().optional(),
  creatureType: z.string().max(TEXT_LIMITS.Name).nullable().optional(),
});

const characterAbilityScoreSchema = z.object({
  name: abilityNameSchema,
  score: z.number().int(),
  saveThrowProficient: z.boolean(),
});

const characterSkillSchema = z.object({
  name: z.string().max(TEXT_LIMITS.Name),
  proficient: z.boolean(),
});

export const createCharacterSchema = z.object({
  name: z.string().min(1).max(TEXT_LIMITS.Name),
  type: characterTypeSchema,
  race: z.string().max(TEXT_LIMITS.Name),
  characterClass: z.string().max(TEXT_LIMITS.Name).optional(),
  campaignId: z.string().min(1).max(TEXT_LIMITS.ShortText),
  background: z.string().max(TEXT_LIMITS.Name).optional(),
  alignment: alignmentSchema.optional(),
  notes: z.string().max(TEXT_LIMITS.Notes).nullable().optional(),
  creatureProfile: creatureProfileSchema.optional(),
}) satisfies z.ZodType<CreateCharacterPayload>;

export const updateCharacterSchema = z
  .object({
    name: z.string().min(1).max(TEXT_LIMITS.Name),
    type: characterTypeSchema,
    race: z.string().max(TEXT_LIMITS.Name),
    characterClass: z.string().max(TEXT_LIMITS.Name),
    subclass: z.string().max(TEXT_LIMITS.Name).nullable(),
    background: z.string().max(TEXT_LIMITS.Name),
    alignment: alignmentSchema,
    notes: z.string().max(TEXT_LIMITS.Notes).nullable(),
    experience: z.number().int(),
    speed: z.number().int(),
    hitDiceType: z.enum(["d6", "d8", "d10", "d12"]),
    hitDiceUsed: z.number().int().min(0),
    maxHp: z.number().int(),
    currentHp: z.number().int(),
    tempHp: z.number().int(),
    deathSaveSuccesses: z.number().int().min(0).max(3),
    deathSaveFailures: z.number().int().min(0).max(3),
    armorClass: z.number().int(),
    usesShield: z.boolean(),
    inspiration: z.boolean(),
    size: z.string().max(TEXT_LIMITS.Name).nullable(),
    senses: z.string().max(TEXT_LIMITS.ShortText).nullable(),
    languages: z.string().max(TEXT_LIMITS.ShortText).nullable(),
    damageVulnerabilities: z.string().max(TEXT_LIMITS.ShortText).nullable(),
    damageResistances: z.string().max(TEXT_LIMITS.ShortText).nullable(),
    damageImmunities: z.string().max(TEXT_LIMITS.ShortText).nullable(),
    conditionImmunities: z.string().max(TEXT_LIMITS.ShortText).nullable(),
    classFeatures: z.string().max(TEXT_LIMITS.Paragraph).nullable(),
    racialTraits: z.string().max(TEXT_LIMITS.Paragraph).nullable(),
    feats: z.string().max(TEXT_LIMITS.Paragraph).nullable(),
    armorProficiencies: z.string().max(TEXT_LIMITS.Paragraph).nullable(),
    weaponProficiencies: z.string().max(TEXT_LIMITS.Paragraph).nullable(),
    toolProficiencies: z.string().max(TEXT_LIMITS.Paragraph).nullable(),
    abilityScores: z.array(characterAbilityScoreSchema),
    skills: z.array(characterSkillSchema),
    attacks: z.array(attackInputSchema),
    creatureProfile: creatureProfileSchema,
    spellSlots: z.array(spellSlotSchema).nullable(),
    abilities: z.array(abilitySchema).nullable(),
    resources: z.array(resourcePoolSchema).nullable(),
  })
  .partial() satisfies z.ZodType<UpdateCharacterPayload>;
