export const ABILITY_NAMES = ["str", "dex", "con", "int", "wis", "cha"] as const;

export type AbilityName = (typeof ABILITY_NAMES)[number];

export const DEFAULT_ABILITY_SCORE = 10;

export type SkillDefinition = {
  name: string;
  ability: AbilityName;
};

export const SKILL_DEFINITIONS = [
  { name: "Athletics", ability: "str" },
  { name: "Acrobatics", ability: "dex" },
  { name: "Sleight of Hand", ability: "dex" },
  { name: "Stealth", ability: "dex" },
  { name: "Arcana", ability: "int" },
  { name: "History", ability: "int" },
  { name: "Investigation", ability: "int" },
  { name: "Nature", ability: "int" },
  { name: "Religion", ability: "int" },
  { name: "Animal Handling", ability: "wis" },
  { name: "Insight", ability: "wis" },
  { name: "Medicine", ability: "wis" },
  { name: "Perception", ability: "wis" },
  { name: "Survival", ability: "wis" },
  { name: "Deception", ability: "cha" },
  { name: "Intimidation", ability: "cha" },
  { name: "Performance", ability: "cha" },
  { name: "Persuasion", ability: "cha" },
] as const satisfies readonly SkillDefinition[];

export const SKILL_NAMES: readonly string[] = SKILL_DEFINITIONS.map((s) => s.name);

export type SpellSlotLevel = {
  level: number;
  total: number;
  used: number;
};

export const SPELL_SLOT_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export const SPELL_SLOT_MAX_BY_LEVEL: Record<number, number> = {
  1: 4,
  2: 3,
  3: 3,
  4: 3,
  5: 3,
  6: 2,
  7: 2,
  8: 1,
  9: 1,
};

export type DiceRollDTO = {
  id:string;
  createdAt: string;
  campaignSessionId: string;
  userId: string;
  characterId: string | null;
  formula: string;
  mode: DiceRollMode;
  resultByDie: any;
  total:number;
}

export type DiceRollMode = "normal" | "advantage" | "disadvantage";