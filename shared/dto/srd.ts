import type { AbilityName } from "../types/dnd.js";
import { type SRD_CATEGORY, type SRD_RARITY, type SRD_SOURCE } from "../constants/srd.js";

export type SrdSource = (typeof SRD_SOURCE)[keyof typeof SRD_SOURCE];

export type SrdCategory = (typeof SRD_CATEGORY)[keyof typeof SRD_CATEGORY];

export type SrdRef = {
  slug: string;
  name: string;
};

export type SrdQuery = {
  search?: string;
  limit?: number;
  offset?: number;
  filters?: Record<string, string | number>;
};

export type SrdListPage<TSummary> = {
  results: TSummary[];
  total: number;
  next: string | null;
};

export type SrdSpellSummary = SrdRef & {
  source: SrdSource;
  level: number;
  school: string | null;
};

export type SrdSpellDamageScaling = {
  damageType: string | null;
  byCharacterLevel: Record<number, string> | null;
  bySlotLevel: Record<number, string> | null;
};

export type SrdSpell = SrdSpellSummary & {
  description: string;
  higherLevel: string | null;
  range: string;
  components: string[];
  material: string | null;
  ritual: boolean;
  concentration: boolean;
  castingTime: string;
  duration: string;
  damage: SrdSpellDamageScaling | null;
  saveAbility: AbilityName | null;
  areaOfEffect: { type: string; size: number } | null;
  classes: string[];
};

export type SrdCreatureSummary = SrdRef & {
  source: SrdSource;
  challengeRating: number;
  type: string | null;
};

export type SrdCreatureAction = {
  name: string;
  description: string;
};

export type SrdCreature = SrdCreatureSummary & {
  size: string | null;
  alignment: string | null;
  armorClass: number;
  armorDescription: string | null;
  hitPoints: number;
  hitDice: string | null;
  speed: Record<string, number>;
  abilities: Record<AbilityName, number>;
  savingThrows: Partial<Record<AbilityName, number>>;
  skills: Record<string, number>;
  senses: string | null;
  languages: string | null;
  damageVulnerabilities: string | null;
  damageResistances: string | null;
  damageImmunities: string | null;
  conditionImmunities: string | null;
  specialAbilities: SrdCreatureAction[];
  actions: SrdCreatureAction[];
  legendaryActions: SrdCreatureAction[];
};

export type SrdRarity = (typeof SRD_RARITY)[keyof typeof SRD_RARITY];

export type SrdItemSummary = SrdRef & {
  source: SrdSource;
  itemType: string | null;
  rarity: SrdRarity | null;
};

export type SrdItemProperty = {
  name: string;
  kind: string | null;
  description: string;
};

export type SrdWeaponDetail = {
  damageDice: string | null;
  damageType: string | null;
  category: string | null;
  properties: SrdItemProperty[];
};

export type SrdArmorDetail = {
  category: string | null;
  armorClass: string | null;
  strengthRequired: number | null;
  stealthDisadvantage: boolean;
};

export type SrdItem = SrdItemSummary & {
  description: string;
  requiresAttunement: boolean;
  cost: string | null;
  weight: string | null;
  weapon: SrdWeaponDetail | null;
  armor: SrdArmorDetail | null;
};

export type SrdConditionSummary = SrdRef & {
  source: SrdSource;
};

export type SrdCondition = SrdConditionSummary & {
  description: string;
};

export type SrdCategoryShape = {
  spell: { summary: SrdSpellSummary; detail: SrdSpell };
  monster: { summary: SrdCreatureSummary; detail: SrdCreature };
  item: { summary: SrdItemSummary; detail: SrdItem };
  condition: { summary: SrdConditionSummary; detail: SrdCondition };
};

export type SrdDetail<TCategory extends SrdCategory> =
  SrdCategoryShape[TCategory]["detail"];

export type SrdSummary<TCategory extends SrdCategory> =
  SrdCategoryShape[TCategory]["summary"];
