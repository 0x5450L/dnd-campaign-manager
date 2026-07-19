import { z } from "zod";
import type {
  AbilityUsagePayload,
  SpellSlotUsagePayload,
  BulkCreateParticipantsPayload,
  BulkInitiativePayload,
  CreateParticipantPayload,
  RollInitiativePayload,
  UpdateEncounterPayload,
  UpdateParticipantPayload,
} from "@shared/dto/session";
import {
  abilityNameSchema,
  abilitySchema,
  attackInputSchema,
  participantAbilityScoreSchema,
  resourcePoolSchema,
  spellSlotSchema,
} from "./common";

const participantTypeSchema = z.enum(["pc", "npc", "monster"]);

export const createEncounterSchema = z.object({
  campaignSessionId: z.string().min(1),
  name: z.string().optional(),
});

export type CreateEncounterBody = z.infer<typeof createEncounterSchema>;

export const updateEncounterSchema = z
  .object({
    status: z.enum(["setup", "active", "ended"]),
    name: z.string(),
  })
  .partial() satisfies z.ZodType<UpdateEncounterPayload>;

export const createParticipantSchema = z.object({
  type: participantTypeSchema,
  name: z.string().min(1),
  characterId: z.string().nullable().optional(),
  sortOrder: z.number().int(),
  maxHp: z.number().int(),
  currentHp: z.number().int(),
  armorClass: z.number().int(),
  tempHp: z.number().int().optional(),
  conditions: z.array(z.string()).optional(),
  isVisible: z.boolean().optional(),
  acHidden: z.boolean().optional(),
  typeHidden: z.boolean().optional(),
  usesShield: z.boolean().optional(),
  abilityScores: z.array(participantAbilityScoreSchema).nullable().optional(),
  spellAbility: abilityNameSchema.nullable().optional(),
  proficiencyBonus: z.number().int().nullable().optional(),
  spellSlots: z.array(spellSlotSchema).nullable().optional(),
  attacks: z.array(attackInputSchema).optional(),
  speed: z.string().nullable().optional(),
  senses: z.string().nullable().optional(),
  challengeRating: z.number().nullable().optional(),
  damageVulnerabilities: z.string().nullable().optional(),
  damageResistances: z.string().nullable().optional(),
  damageImmunities: z.string().nullable().optional(),
  conditionImmunities: z.string().nullable().optional(),
  abilities: z.array(abilitySchema).nullable().optional(),
  resources: z.array(resourcePoolSchema).nullable().optional(),
}) satisfies z.ZodType<CreateParticipantPayload>;

export const bulkCreateParticipantsSchema = z.object({
  participants: z.array(createParticipantSchema).min(1),
}) satisfies z.ZodType<BulkCreateParticipantsPayload>;

export const updateParticipantSchema = z
  .object({
    name: z.string().min(1),
    sortOrder: z.number().int(),
    maxHp: z.number().int(),
    currentHp: z.number().int(),
    tempHp: z.number().int(),
    armorClass: z.number().int(),
    attacks: z.array(attackInputSchema),
    conditions: z.array(z.string()),
    isVisible: z.boolean(),
    acHidden: z.boolean(),
    typeHidden: z.boolean(),
    usesShield: z.boolean(),
    abilityScores: z.array(participantAbilityScoreSchema).nullable(),
    spellAbility: abilityNameSchema.nullable(),
    proficiencyBonus: z.number().int().nullable(),
    spellSlots: z.array(spellSlotSchema).nullable(),
    deathSaveSuccesses: z.number().int().min(0).max(3),
    deathSaveFailures: z.number().int().min(0).max(3),
    speed: z.string().nullable(),
    senses: z.string().nullable(),
    challengeRating: z.number().nullable(),
    damageVulnerabilities: z.string().nullable(),
    damageResistances: z.string().nullable(),
    damageImmunities: z.string().nullable(),
    conditionImmunities: z.string().nullable(),
    abilities: z.array(abilitySchema).nullable(),
    resources: z.array(resourcePoolSchema).nullable(),
  })
  .partial() satisfies z.ZodType<UpdateParticipantPayload>;

export const bulkInitiativeSchema = z.object({
  entries: z
    .array(
      z.object({
        participantId: z.string().min(1),
        sortOrder: z.number().int(),
      }),
    )
    .min(1),
}) satisfies z.ZodType<BulkInitiativePayload>;

export const rollInitiativeSchema = z.object({
  participantIds: z.array(z.string()).optional(),
}) satisfies z.ZodType<RollInitiativePayload>;

export const abilityUsageSchema = z.object({
  action: z.enum(["spend", "restore"]),
  slotLevel: z.number().int().min(1).max(9).optional(),
}) satisfies z.ZodType<AbilityUsagePayload>;

export const spellSlotUsageSchema = z.object({
  level: z.number().int().min(1).max(9),
  action: z.enum(["spend", "restore"]),
}) satisfies z.ZodType<SpellSlotUsagePayload>;

export const listEncountersQuerySchema = z.object({
  campaignSessionId: z.string().min(1),
});

export const removeParticipantsQuerySchema = z.object({
  ids: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string()).min(1)),
});
