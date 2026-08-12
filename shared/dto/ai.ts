import {
  AI_GENERATION_KIND,
  AI_PROVIDER_ID,
  LOOT_FIND_TYPE,
  LOOT_RICHNESS,
} from "../constants/ai";
import type { SrdRarity, SrdSource } from "./srd";
import type {
  EncounterBudget,
  EncounterDifficulty,
  EncounterSizeBand,
  EncounterXpReport,
} from "../types/encounter";
import type { CreateParticipantPayload } from "./session";

export type AiProviderId = (typeof AI_PROVIDER_ID)[keyof typeof AI_PROVIDER_ID];

export type AiGenerationKind =
  (typeof AI_GENERATION_KIND)[keyof typeof AI_GENERATION_KIND];

export type LootFindType = (typeof LOOT_FIND_TYPE)[keyof typeof LOOT_FIND_TYPE];

export type LootRichness = (typeof LOOT_RICHNESS)[keyof typeof LOOT_RICHNESS];

export type GenerateLootPayload = {
  campaignId: string;
  findType: LootFindType;
  richness: LootRichness;
  itemCount: number;
  context?: string;
  excludeSlugs?: string[];
};

export type GeneratedLootItem = {
  slug: string;
  name: string;
  rarity: SrdRarity | null;
  itemType: string | null;
  source: SrdSource;
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

export type GenerateEncounterPayload = {
  campaignId: string;
  encounterId: string;
  difficulty: EncounterDifficulty;
  sizeBand: EncounterSizeBand;
  partyLevel: number;
  partySize: number;
  context?: string;
  excludeSlugs?: string[];
};

export type GeneratedEncounterEntry = {
  slug: string;
  name: string;
  challengeRating: number;
  source: SrdSource;
  count: number;
  xpEach: number;
  note: string;
};

export type GeneratedEncounter = {
  readAloud: string;
  tacticalNote: string;
  entries: GeneratedEncounterEntry[];
  budget: EncounterBudget;
  xp: EncounterXpReport;
  participants: CreateParticipantPayload[];
};

export type EncounterGeneration = AiGeneration<
  GenerateEncounterPayload,
  GeneratedEncounter
>;

export type GenerateEncounterResponse = {
  status: "ok" | "error";
  generation: EncounterGeneration;
};
