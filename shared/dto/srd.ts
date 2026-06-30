import type { AbilityName } from "../types/dnd";
import { SRD_CATEGORY, SRD_SOURCE } from "../constants/srd";

export type SrdSource = (typeof SRD_SOURCE)[keyof typeof SRD_SOURCE];

export type SrdCategory = (typeof SRD_CATEGORY)[keyof typeof SRD_CATEGORY];

export interface SrdRef {
  slug: string;
  name: string;
}

export interface SrdQuery {
  search?: string;
  limit?: number;
  offset?: number;
  filters?: Record<string, string | number>;
}

export interface SrdListPage<TSummary> {
  results: TSummary[];
  total: number;
  next: string | null;
}

export interface SrdSpellSummary extends SrdRef {
  source: SrdSource;
  level: number;
  school: string | null;
}

export interface SrdSpellDamageScaling {
  damageType: string | null;
  byCharacterLevel: Record<number, string> | null;
  bySlotLevel: Record<number, string> | null;
}

export interface SrdSpell extends SrdSpellSummary {
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
}

export interface SrdMonsterSummary extends SrdRef {
  source: SrdSource;
  challengeRating: number;
  type: string | null;
}

export interface SrdMonsterAction {
  name: string;
  description: string;
}

export interface SrdMonster extends SrdMonsterSummary {
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
  specialAbilities: SrdMonsterAction[];
  actions: SrdMonsterAction[];
  legendaryActions: SrdMonsterAction[];
}

export interface SrdItemSummary extends SrdRef {
  source: SrdSource;
  itemType: string | null;
  rarity: string | null;
}

export interface SrdItem extends SrdItemSummary {
  description: string;
  requiresAttunement: boolean;
  cost: string | null;
  weight: string | null;
}

export interface SrdConditionSummary extends SrdRef {
  source: SrdSource;
}

export interface SrdCondition extends SrdConditionSummary {
  description: string;
}

export interface SrdCategoryShape {
  spell: { summary: SrdSpellSummary; detail: SrdSpell };
  monster: { summary: SrdMonsterSummary; detail: SrdMonster };
  item: { summary: SrdItemSummary; detail: SrdItem };
  condition: { summary: SrdConditionSummary; detail: SrdCondition };
}

export type SrdDetail<TCategory extends SrdCategory> =
  SrdCategoryShape[TCategory]["detail"];

export type SrdSummary<TCategory extends SrdCategory> =
  SrdCategoryShape[TCategory]["summary"];
