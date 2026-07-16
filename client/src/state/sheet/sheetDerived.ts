import {
  calcModifier,
  getProficiencyBonus,
} from "@/utils/dndMath";
import type {
  AbilityName,
  CharacterSheetState,
  SheetState,
  SkillDef,
} from "@/types/characters/characterSheet";

export const getSheetProficiencyBonus = (state: SheetState): number =>
  getProficiencyBonus(state.level);

export const getAbilityModifier = (
  state: SheetState,
  ability: AbilityName,
): number => calcModifier(state.abilities[ability].score);

export const getSaveValue = (
  state: SheetState,
  ability: AbilityName,
): number => {
  const mod = getAbilityModifier(state, ability);
  return state.abilities[ability].saveProficient
    ? mod + getSheetProficiencyBonus(state)
    : mod;
};

export const getSkillValue = (state: SheetState, skill: SkillDef): number => {
  const mod = getAbilityModifier(state, skill.ability);
  return skill.proficient ? mod + getSheetProficiencyBonus(state) : mod;
};

export const getSkillsForAbility = (
  state: SheetState,
  ability: AbilityName,
): { name: string; proficient: boolean; value: number }[] =>
  state.skills
    .filter((s) => s.ability === ability)
    .map((s) => ({
      name: s.name,
      proficient: s.proficient,
      value: getSkillValue(state, s),
    }));

export const getInitiative = (state: SheetState): number =>
  getAbilityModifier(state, "dex");

export const getPassivePerception = (state: SheetState): number => {
  const perception = state.skills.find((s) => s.name === "Perception");
  return 10 + (perception ? getSkillValue(state, perception) : 0);
};

export const getHitDiceMax = (state: CharacterSheetState): number =>
  state.level;

export const getHitDiceRemaining = (state: CharacterSheetState): number =>
  Math.max(0, state.level - state.hitDiceUsed);
