import { type ABILITY_NAMES } from "../constants/dnd.js";

export type AbilityName = (typeof ABILITY_NAMES)[number];

export type SkillDefinition = {
  name: string;
  ability: AbilityName;
};

export type SpellSlotLevel = {
  level: number;
  total: number;
  used: number;
};
