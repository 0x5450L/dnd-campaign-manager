import { SRD_RARITY } from "@dnd/shared/constants/srd";
import type { SrdRarity } from "@dnd/shared/dto/srd";

const BY_NORMALIZED = new Map<string, SrdRarity>(
  Object.values(SRD_RARITY).map((rarity) => [rarity, rarity]),
);

export const normalizeSrdRarity = (raw: string | null | undefined): SrdRarity | null => {
  if (!raw) {
    return null;
  }
  const key = raw.trim().toLowerCase().replace(/\s+/g, "-");
  return BY_NORMALIZED.get(key) ?? null;
};
