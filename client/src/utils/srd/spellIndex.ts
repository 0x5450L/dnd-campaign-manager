import type { SrdSpell } from "@shared/dto/srd";

export type SpellIndex = Map<string, SrdSpell>;

const normalizeName = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "");

const indexCache = new WeakMap<SrdSpell[], SpellIndex>();

export const buildSpellIndex = (spells: SrdSpell[]): SpellIndex => {
  const cached = indexCache.get(spells);
  if (cached) {
    return cached;
  }
  const index: SpellIndex = new Map();
  for (const spell of spells) {
    index.set(normalizeName(spell.name), spell);
    index.set(normalizeName(spell.slug), spell);
  }
  indexCache.set(spells, index);
  return index;
};

export const lookupSpell = (
  index: SpellIndex,
  name: string,
): SrdSpell | null => index.get(normalizeName(name)) ?? null;
