import { z } from "zod";
import { ABILITY_NAMES } from "@shared/constants/dnd";
import type {
  Ability,
  AbilityCost,
  ResourcePool,
} from "@shared/types/abilities";
import type { SpellSlotLevel } from "@shared/types/dnd";
import type { CharacterAttackInput } from "@shared/dto/character";
import type { ParticipantAbilityScore } from "@shared/dto/session";

export const abilityNameSchema = z.enum(ABILITY_NAMES);

export const attackInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  damage: z.string(),
  attackBonus: z.number().int(),
  notes: z.string().nullable().optional(),
}) satisfies z.ZodType<CharacterAttackInput>;

export const spellSlotSchema = z.object({
  level: z.number().int().min(1).max(9),
  total: z.number().int().min(0),
  used: z.number().int().min(0),
}) satisfies z.ZodType<SpellSlotLevel>;

export const abilityCostSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("recharge"),
    threshold: z.number().int(),
    charged: z.boolean(),
  }),
  z.object({
    type: z.literal("perDay"),
    max: z.number().int(),
    remaining: z.number().int(),
  }),
  z.object({ type: z.literal("spellSlot"), level: z.number().int() }),
  z.object({
    type: z.literal("pool"),
    pool: z.string(),
    amount: z.number().int(),
  }),
]) satisfies z.ZodType<AbilityCost>;

export const abilitySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  activation: z.enum([
    "passive",
    "action",
    "bonus",
    "reaction",
    "free",
    "legendary",
  ]),
  cost: abilityCostSchema.nullable(),
}) satisfies z.ZodType<Ability>;

export const resourcePoolSchema = z.object({
  key: z.string().min(1),
  label: z.string(),
  max: z.number().int(),
  remaining: z.number().int(),
  resetOn: z.enum(["turn", "round", "shortRest", "longRest", "never"]),
}) satisfies z.ZodType<ResourcePool>;

export const participantAbilityScoreSchema = z.object({
  name: abilityNameSchema,
  score: z.number().int(),
}) satisfies z.ZodType<ParticipantAbilityScore>;
