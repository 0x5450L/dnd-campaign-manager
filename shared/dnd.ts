/**
 * Shared D&D 5e domain constants — single source of truth for both client and server.
 *
 * IMPORTANT: this file must remain free of any client-only (React/DOM) or
 * server-only (@prisma/client, Express) dependencies. Only plain TypeScript values.
 */

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
