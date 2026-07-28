import type { SrdCategory, SrdSource } from "../dto/srd";

export const SRD_SOURCE = {
  Dnd5eApi: "dnd5eapi",
  Open5e: "open5e",
  Open5eV2: "open5e-v2",
} as const;

export const SRD_SOURCES = Object.values(SRD_SOURCE) as SrdSource[];

export const SRD_CATEGORY = {
  Spell: "spell",
  Monster: "monster",
  Item: "item",
  Condition: "condition",
} as const;

export const SRD_CATEGORIES = Object.values(SRD_CATEGORY) as SrdCategory[];

export const SRD_RARITY = {
  Common: "common",
  Uncommon: "uncommon",
  Rare: "rare",
  VeryRare: "very-rare",
  Legendary: "legendary",
  Artifact: "artifact",
} as const;
