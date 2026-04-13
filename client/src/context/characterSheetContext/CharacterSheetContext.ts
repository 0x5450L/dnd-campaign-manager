import { createContext } from "react";

export const MIN_ATTACKS = 3;

export type AbilityName = "str" | "dex" | "con" | "int" | "wis" | "cha";

export type AbilityState = {
  score: number;
  saveProficient: boolean;
};

export type SkillDef = {
  name: string;
  ability: AbilityName;
  proficient: boolean;
};

export type Attack = {
  id: string;
  name: string;
  attackBonus: string;
  damage: string;
  notes: string;
};

export type HitDiceType = "d6" | "d8" | "d10" | "d12";

export type CharacterSheetState = {
  // Header
  name: string;
  race: string;
  characterClass: string;
  level: number;
  background: string;
  subclass: string;
  xp: number;

  // Abilities & skills
  abilities: Record<AbilityName, AbilityState>;
  skills: SkillDef[];

  // Combat
  ac: number;
  usesShield: boolean;
  speed: number;
  size: string;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  hitDiceType: HitDiceType;
  hitDiceUsed: number;
  deathSaveSuccesses: number;
  deathSaveFailures: number;
  inspiration: boolean;

  // Attacks
  attacks: Attack[];

  // Text blocks
  classFeatures: string;
  racialTraits: string;
  feats: string;
  notes: string;

  // Proficiencies
  armorProficiencies: string;
  weaponProficiencies: string;
  toolProficiencies: string;
};

export type UseHitDieResult = {
  rolled: number;
  conMod: number;
  healed: number;
  newCurrentHp: number;
} | null;

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
