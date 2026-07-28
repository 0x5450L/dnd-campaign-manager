import type { SrdItem, SrdItemSummary, SrdSource } from "@shared/dto/srd";
import { normalizeSrdRarity } from "./rarity";

export type Open5eV2Document = {
  key: string;
  name: string;
};

export type Open5eV2ItemResult = {
  key: string;
  name: string;
  desc: string | null;
  rarity: string | null;
  category: { key: string; name: string } | null;
  requires_attunement: boolean | string | null;
  weight: string | null;
  weight_unit: string | null;
  cost: string | null;
  document: Open5eV2Document | null;
};

export type Open5eV2ListResponse<TResult> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: TResult[];
};

const trimDecimals = (raw: string | null): string | null => {
  if (!raw) {
    return null;
  }
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value) || value === 0) {
    return null;
  }
  return String(value);
};

const formatCost = (raw: string | null): string | null => {
  const amount = trimDecimals(raw);
  return amount ? `${amount} gp` : null;
};

const formatWeight = (raw: string | null, unit: string | null): string | null => {
  const amount = trimDecimals(raw);
  return amount ? `${amount} ${unit ?? "lb"}` : null;
};

export const mapOpen5eV2ItemSummary = (
  raw: Open5eV2ItemResult,
  source: SrdSource,
): SrdItemSummary => ({
  slug: raw.key,
  name: raw.name,
  source,
  itemType: raw.category?.name ?? null,
  rarity: normalizeSrdRarity(raw.rarity),
});

export const mapOpen5eV2Item = (
  raw: Open5eV2ItemResult,
  source: SrdSource,
): SrdItem => ({
  ...mapOpen5eV2ItemSummary(raw, source),
  description: raw.desc?.trim() ?? "",
  requiresAttunement:
    typeof raw.requires_attunement === "string"
      ? !!raw.requires_attunement.trim()
      : !!raw.requires_attunement,
  cost: formatCost(raw.cost),
  weight: formatWeight(raw.weight, raw.weight_unit),
});
