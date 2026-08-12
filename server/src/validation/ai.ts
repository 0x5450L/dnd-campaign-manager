import { z } from "zod";
import {
  AI_EXCLUDE_SLUGS_MAX,
  LOOT_CONTEXT_MAX_LENGTH,
  LOOT_FIND_TYPE,
  LOOT_ITEM_COUNT,
  LOOT_RICHNESS,
} from "@shared/constants/ai";
import {
  ENCOUNTER_CONTEXT_MAX_LENGTH,
  ENCOUNTER_DIFFICULTY,
  ENCOUNTER_SIZE_BAND,
  MAX_PARTY_SIZE,
  MIN_PARTY_SIZE,
} from "@shared/constants/encounter";
import { MAX_LEVEL, MIN_LEVEL } from "@shared/constants/dndMath";
import type { LootFindType, LootRichness } from "@shared/dto/ai";
import type {
  EncounterDifficulty,
  EncounterSizeBand,
} from "@shared/types/encounter";

const findTypeValues = Object.values(LOOT_FIND_TYPE) as [
  LootFindType,
  ...LootFindType[],
];

const richnessValues = Object.values(LOOT_RICHNESS) as [
  LootRichness,
  ...LootRichness[],
];

const excludeSlugsSchema = z
  .array(z.string().trim().min(1))
  .max(AI_EXCLUDE_SLUGS_MAX)
  .optional();

export const generateLootSchema = z.object({
  campaignId: z.string().uuid(),
  findType: z.enum(findTypeValues),
  richness: z.enum(richnessValues),
  itemCount: z
    .number()
    .int()
    .min(LOOT_ITEM_COUNT.Min)
    .max(LOOT_ITEM_COUNT.Max),
  context: z.string().trim().max(LOOT_CONTEXT_MAX_LENGTH).optional(),
  excludeSlugs: excludeSlugsSchema,
});

export type GenerateLootBody = z.infer<typeof generateLootSchema>;

const difficultyValues = Object.values(ENCOUNTER_DIFFICULTY) as [
  EncounterDifficulty,
  ...EncounterDifficulty[],
];

const sizeBandValues = Object.values(ENCOUNTER_SIZE_BAND) as [
  EncounterSizeBand,
  ...EncounterSizeBand[],
];

export const generateEncounterSchema = z.object({
  campaignId: z.string().uuid(),
  encounterId: z.string().uuid(),
  difficulty: z.enum(difficultyValues),
  sizeBand: z.enum(sizeBandValues),
  partyLevel: z.number().int().min(MIN_LEVEL).max(MAX_LEVEL),
  partySize: z.number().int().min(MIN_PARTY_SIZE).max(MAX_PARTY_SIZE),
  context: z.string().trim().max(ENCOUNTER_CONTEXT_MAX_LENGTH).optional(),
  excludeSlugs: excludeSlugsSchema,
});

export type GenerateEncounterBody = z.infer<typeof generateEncounterSchema>;
