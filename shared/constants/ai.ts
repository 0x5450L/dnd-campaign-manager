export const AI_PROVIDER_ID = {
  Gemini: "gemini",
  Mock: "mock",
} as const;

export const AI_GENERATION_KIND = {
  Loot: "loot",
  Encounter: "encounter",
} as const;

export const LOOT_FIND_TYPE = {
  Hoard: "hoard",
  Body: "body",
  Stash: "stash",
  Reward: "reward",
} as const;

export const LOOT_RICHNESS = {
  Meager: "meager",
  Modest: "modest",
  Generous: "generous",
} as const;

export const LOOT_ITEM_COUNT = {
  Min: 1,
  Max: 8,
  Default: 3,
} as const;

export const LOOT_CONTEXT_MAX_LENGTH = 400;

export const LOOT_CANDIDATE_COUNT = 40;

export const AI_EXCLUDE_SLUGS_MAX = 24;
