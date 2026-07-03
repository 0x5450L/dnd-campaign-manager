import type { AbilityName, SpellSlotLevel } from "../../../../shared/types/dnd";
import type { CreatureTraitKind } from "../../../../shared/dto/character";
export type { AbilityName, SpellSlotLevel, CreatureTraitKind };

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

export type CreatureTrait = {
  id: string;
  kind: CreatureTraitKind;
  name: string;
  description: string;
};

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

  // Spellcasting
  spellSlots: SpellSlotLevel[] | null;

  challengeRating: number | null;
  senses: string;
  languages: string;
  damageVulnerabilities: string;
  damageResistances: string;
  damageImmunities: string;
  conditionImmunities: string;
  traits: CreatureTrait[];

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
