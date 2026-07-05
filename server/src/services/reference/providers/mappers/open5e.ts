import type { AbilityName } from "../../../../../../shared/types/dnd";
import type {
  SrdCondition,
  SrdConditionSummary,
  SrdCreature,
  SrdCreatureAction,
  SrdCreatureSummary,
  SrdSource,
} from "../../../../../../shared/dto/srd";

export type Open5eConditionResult = {
  slug: string;
  name: string;
  desc: string;
};

export type Open5eActionResult = {
  name: string;
  desc: string;
};

export type Open5eMonsterResult = {
  slug: string;
  name: string;
  size: string | null;
  type: string | null;
  alignment: string | null;
  armor_class: number;
  armor_desc: string | null;
  hit_points: number;
  hit_dice: string | null;
  speed: Record<string, number> | null;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  strength_save: number | null;
  dexterity_save: number | null;
  constitution_save: number | null;
  intelligence_save: number | null;
  wisdom_save: number | null;
  charisma_save: number | null;
  skills: Record<string, number> | null;
  senses: string | null;
  languages: string | null;
  damage_vulnerabilities: string | null;
  damage_resistances: string | null;
  damage_immunities: string | null;
  condition_immunities: string | null;
  challenge_rating: string;
  cr: number;
  actions: Open5eActionResult[] | null;
  special_abilities: Open5eActionResult[] | null;
  legendary_actions: Open5eActionResult[] | null;
};

export type Open5eListResponse<TResult> = {
  count: number;
  next: string | null;
  results: TResult[];
};

const SAVE_FIELDS: ReadonlyArray<[AbilityName, keyof Open5eMonsterResult]> = [
  ["str", "strength_save"],
  ["dex", "dexterity_save"],
  ["con", "constitution_save"],
  ["int", "intelligence_save"],
  ["wis", "wisdom_save"],
  ["cha", "charisma_save"],
];

const emptyToNull = (value: string | null): string | null =>
  value && value.trim() !== "" ? value : null;

const mapActions = (
  actions: Open5eActionResult[] | null,
): SrdCreatureAction[] => {
  if (!actions) {
    return [];
  }
  return actions.map((action) => ({
    name: action.name,
    description: action.desc,
  }));
};

const collectSaves = (
  raw: Open5eMonsterResult,
): Partial<Record<AbilityName, number>> => {
  const result: Partial<Record<AbilityName, number>> = {};
  for (const [ability, field] of SAVE_FIELDS) {
    const value = raw[field];
    if (typeof value === "number") {
      result[ability] = value;
    }
  }
  return result;
};

export const mapOpen5eCondition = (
  raw: Open5eConditionResult,
  source: SrdSource,
): SrdCondition => ({
  slug: raw.slug,
  name: raw.name,
  source,
  description: raw.desc,
});

export const mapOpen5eConditionSummary = (
  raw: Open5eConditionResult,
  source: SrdSource,
): SrdConditionSummary => ({
  slug: raw.slug,
  name: raw.name,
  source,
});

export const mapOpen5eCreatureSummary = (
  raw: Open5eMonsterResult,
  source: SrdSource,
): SrdCreatureSummary => ({
  slug: raw.slug,
  name: raw.name,
  source,
  challengeRating: raw.cr,
  type: raw.type ?? null,
});

export const mapOpen5eCreature = (
  raw: Open5eMonsterResult,
  source: SrdSource,
): SrdCreature => ({
  slug: raw.slug,
  name: raw.name,
  source,
  challengeRating: raw.cr,
  type: emptyToNull(raw.type),
  size: emptyToNull(raw.size),
  alignment: emptyToNull(raw.alignment),
  armorClass: raw.armor_class,
  armorDescription: emptyToNull(raw.armor_desc),
  hitPoints: raw.hit_points,
  hitDice: emptyToNull(raw.hit_dice),
  speed: raw.speed ?? {},
  abilities: {
    str: raw.strength,
    dex: raw.dexterity,
    con: raw.constitution,
    int: raw.intelligence,
    wis: raw.wisdom,
    cha: raw.charisma,
  },
  savingThrows: collectSaves(raw),
  skills: raw.skills ?? {},
  senses: emptyToNull(raw.senses),
  languages: emptyToNull(raw.languages),
  damageVulnerabilities: emptyToNull(raw.damage_vulnerabilities),
  damageResistances: emptyToNull(raw.damage_resistances),
  damageImmunities: emptyToNull(raw.damage_immunities),
  conditionImmunities: emptyToNull(raw.condition_immunities),
  specialAbilities: mapActions(raw.special_abilities),
  actions: mapActions(raw.actions),
  legendaryActions: mapActions(raw.legendary_actions),
});
