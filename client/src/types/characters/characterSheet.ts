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

export type SheetKind = "character" | "creature";

export type SharedSheetFields = {
  name: string;
  race: string;
  size: string;
  level: number;

  abilities: Record<AbilityName, AbilityState>;
  skills: SkillDef[];

  ac: number;
  usesShield: boolean;
  speed: number;
  currentHp: number;
  maxHp: number;
  tempHp: number;

  attacks: Attack[];

  senses: string;
  languages: string;
  damageVulnerabilities: string;
  damageResistances: string;
  damageImmunities: string;
  conditionImmunities: string;

  notes: string;
};

export type CharacterSheetFields = {
  characterClass: string;
  subclass: string;
  background: string;
  xp: number;

  hitDiceType: HitDiceType;
  hitDiceUsed: number;
  deathSaveSuccesses: number;
  deathSaveFailures: number;
  inspiration: boolean;

  spellSlots: SpellSlotLevel[] | null;

  classFeatures: string;
  racialTraits: string;
  feats: string;

  armorProficiencies: string;
  weaponProficiencies: string;
  toolProficiencies: string;
};

export type CreatureSheetFields = {
  challengeRating: number | null;
  traits: CreatureTrait[];
};

export type CharacterSheetState = { kind: "character" } & SharedSheetFields &
  CharacterSheetFields;

export type CreatureSheetState = { kind: "creature" } & SharedSheetFields &
  CreatureSheetFields;

export type SheetState = CharacterSheetState | CreatureSheetState;

export type UseHitDieResult = {
  rolled: number;
  conMod: number;
  healed: number;
  newCurrentHp: number;
} | null;
