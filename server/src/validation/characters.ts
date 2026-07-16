import { z } from "zod";
import type {
  CreateCharacterPayload,
  UpdateCharacterPayload,
} from "@shared/dto/character";
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
  creatureType: z.string().nullable().optional(),
});

const characterAbilityScoreSchema = z.object({
  name: abilityNameSchema,
  score: z.number().int(),
  saveThrowProficient: z.boolean(),
});

const characterSkillSchema = z.object({
  name: z.string(),
  proficient: z.boolean(),
});

export const createCharacterSchema = z.object({
  name: z.string().min(1),
  type: characterTypeSchema,
  race: z.string(),
  characterClass: z.string(),
  campaignId: z.string().min(1),
  background: z.string().optional(),
  alignment: alignmentSchema.optional(),
  notes: z.string().nullable().optional(),
  creatureProfile: creatureProfileSchema.optional(),
}) satisfies z.ZodType<CreateCharacterPayload>;

export const updateCharacterSchema = z
  .object({
    name: z.string().min(1),
    type: characterTypeSchema,
    race: z.string(),
    characterClass: z.string(),
    background: z.string(),
    alignment: alignmentSchema,
    notes: z.string().nullable(),
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
    size: z.string().nullable(),
    senses: z.string().nullable(),
    languages: z.string().nullable(),
    damageVulnerabilities: z.string().nullable(),
    damageResistances: z.string().nullable(),
    damageImmunities: z.string().nullable(),
    conditionImmunities: z.string().nullable(),
    abilityScores: z.array(characterAbilityScoreSchema),
    skills: z.array(characterSkillSchema),
    attacks: z.array(attackInputSchema),
    creatureProfile: creatureProfileSchema,
    spellSlots: z.array(spellSlotSchema).nullable(),
    abilities: z.array(abilitySchema).nullable(),
    resources: z.array(resourcePoolSchema).nullable(),
  })
  .partial() satisfies z.ZodType<UpdateCharacterPayload>;
