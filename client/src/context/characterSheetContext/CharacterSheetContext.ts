import { createContext } from "react";
import type {
  AbilityName,
  Attack,
  CharacterSheetState,
  SkillDef,
  UseHitDieResult,
} from "../../types/characters/characterSheet";

export type CharacterSheetContextType = {
  state: CharacterSheetState;

  // Derived
  proficiencyBonus: number;
  getModifier: (ability: AbilityName) => number;
  getSaveValue: (ability: AbilityName) => number;
  getSkillValue: (skill: SkillDef) => number;
  getSkillsForAbility: (
    ability: AbilityName,
  ) => { name: string; proficient: boolean; value: number }[];
  initiative: number;
  passivePerception: number;
  conMod: number;
  hitDiceMax: number;
  hitDiceRemaining: number;

  // Generic setters
  setField: <K extends keyof CharacterSheetState>(
    field: K,
    value: CharacterSheetState[K],
  ) => void;

  // Ability / skills
  setAbilityScore: (ability: AbilityName, score: number) => void;
  setSaveProficient: (ability: AbilityName, proficient: boolean) => void;
  setSkillProficient: (skillName: string, proficient: boolean) => void;

  // Toggles
  toggleShield: () => void;
  toggleInspiration: () => void;

  // Attacks
  addAttack: () => void;
  updateAttack: (id: string, field: keyof Attack, value: string) => void;
  removeAttack: (id: string) => void;

  // HP / Hit dice actions
  heal: (amount: number) => void;
  damage: (amount: number) => void;
  spendHitDie: () => UseHitDieResult;
  resetHitDice: () => void;
  longRest: () => void;
};

export const CharacterSheetContext =
  createContext<CharacterSheetContextType | null>(null);