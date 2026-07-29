import { LOOT_RICHNESS } from "@shared/constants/ai";
import { SRD_RARITY } from "@shared/constants/srd";
import type { LootRichness } from "@shared/dto/ai";
import type { SrdItemSummary, SrdRarity } from "@shared/dto/srd";

const MUNDANE = null;

type RarityBand = (SrdRarity | null)[];

const BANDS: Record<LootRichness, RarityBand> = {
  [LOOT_RICHNESS.Meager]: [MUNDANE, SRD_RARITY.Common],
  [LOOT_RICHNESS.Modest]: [
    MUNDANE,
    SRD_RARITY.Common,
    SRD_RARITY.Uncommon,
  ],
  [LOOT_RICHNESS.Generous]: [
    SRD_RARITY.Uncommon,
    SRD_RARITY.Rare,
    SRD_RARITY.VeryRare,
  ],
};

const shuffle = <T>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const selectLootCandidates = (
  pool: SrdItemSummary[],
  richness: LootRichness,
  limit: number,
): SrdItemSummary[] => {
  const band = new Set<SrdRarity | null>(BANDS[richness]);
  const matching = pool.filter((item) => band.has(item.rarity));
  const source = matching.length > 0 ? matching : pool;
  return shuffle(source).slice(0, limit);
};
