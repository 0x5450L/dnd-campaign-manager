import {
  AI_GENERATION_KIND,
  AI_PROVIDER_ID,
  LOOT_FIND_TYPE,
  LOOT_RARITY,
  LOOT_RICHNESS,
} from "../constants/ai";

export type AiProviderId = (typeof AI_PROVIDER_ID)[keyof typeof AI_PROVIDER_ID];

export type AiGenerationKind =
  (typeof AI_GENERATION_KIND)[keyof typeof AI_GENERATION_KIND];

export type LootFindType = (typeof LOOT_FIND_TYPE)[keyof typeof LOOT_FIND_TYPE];

export type LootRichness = (typeof LOOT_RICHNESS)[keyof typeof LOOT_RICHNESS];

export type LootRarity = (typeof LOOT_RARITY)[keyof typeof LOOT_RARITY];

export type GenerateLootPayload = {
  campaignId: string;
  findType: LootFindType;
  richness: LootRichness;
  itemCount: number;
  context?: string;
};

export type GeneratedLootItem = {
  name: string;
  rarity: LootRarity;
  note: string;
};

export type GeneratedLoot = {
  readAloud: string;
  items: GeneratedLootItem[];
};

export type AiGenerationMeta = {
  id: string;
  kind: AiGenerationKind;
  campaignId: string;
  provider: AiProviderId;
  model: string;
  createdAt: string;
};

export type AiGeneration<TInput, TOutput> = {
  meta: AiGenerationMeta;
  input: TInput;
  output: TOutput;
};

export type LootGeneration = AiGeneration<GenerateLootPayload, GeneratedLoot>;

export type GenerateLootResponse = {
  status: "ok" | "error";
  generation: LootGeneration;
};
