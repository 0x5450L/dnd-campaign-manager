import { ABILITY_NAMES } from "../constants/dnd";

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
