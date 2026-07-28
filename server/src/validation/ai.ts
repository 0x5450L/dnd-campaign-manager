import { z } from "zod";
import {
  LOOT_CONTEXT_MAX_LENGTH,
  LOOT_FIND_TYPE,
  LOOT_ITEM_COUNT,
  LOOT_RICHNESS,
} from "@shared/constants/ai";
import type { LootFindType, LootRichness } from "@shared/dto/ai";

const findTypeValues = Object.values(LOOT_FIND_TYPE) as [
  LootFindType,
  ...LootFindType[],
];

const richnessValues = Object.values(LOOT_RICHNESS) as [
  LootRichness,
  ...LootRichness[],
];

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
});

export type GenerateLootBody = z.infer<typeof generateLootSchema>;
