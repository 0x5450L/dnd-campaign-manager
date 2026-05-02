import type { AbilityName } from "../../../../shared/dnd";
export type { AbilityName };

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
  // Lore
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
