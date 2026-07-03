import type { AbilityName, SpellSlotLevel } from "../types/dnd";

export type CharacterType = "player" | "npc" | "monster";

export type Alignment =
  | "lawful_good"
  | "neutral_good"
  | "chaotic_good"
  | "lawful_neutral"
  | "true_neutral"
  | "chaotic_neutral"
  | "lawful_evil"
  | "neutral_evil"
  | "chaotic_evil";

export type HitDiceType = "d6" | "d8" | "d10" | "d12";

export type CharacterAbilityDTO = {
  name: AbilityName;
  score: number;
  saveThrowProficient: boolean;
};

export type CharacterSkillDTO = {
  name: string;
  proficient: boolean;
};

export type CharacterAttackInput = {
  name: string;
  damage: string;
  attackBonus: number;
  notes?: string | null;
};

export type CharacterAttackDTO = CharacterAttackInput & {
  id: string;
};

export type CreatureTraitKind = "trait" | "legendary_action";

export type CreatureTraitInput = {
  kind: CreatureTraitKind;
  name: string;
  description: string;
};

export type CreatureTraitDTO = CreatureTraitInput & {
  id: string;
};

export type CreatureProfileInput = {
  challengeRating?: number | null;
  creatureType?: string | null;
  traits?: CreatureTraitInput[];
};

export type CreatureProfileDTO = {
  id: string;
  challengeRating: number | null;
  creatureType: string | null;
  traits: CreatureTraitDTO[];
};

export type CharacterDTO = {
  id: string;
  name: string;
  type: CharacterType;
  race: string;
  characterClass: string;
  background: string;
  alignment: Alignment;
  notes: string | null;
  experience: number;
  speed: number;
  hitDiceType: HitDiceType;
  hitDiceUsed: number;
  maxHp: number;
  currentHp: number;
  tempHp: number;
  deathSaveSuccesses: number;
  deathSaveFailures: number;
  armorClass: number;
  usesShield: boolean;
  inspiration: boolean;
  size: string | null;
  senses: string | null;
  languages: string | null;
  damageVulnerabilities: string | null;
  damageResistances: string | null;
  damageImmunities: string | null;
  conditionImmunities: string | null;
  campaignId: string;
  userId: string;
  abilityScores: CharacterAbilityDTO[];
  skills: CharacterSkillDTO[];
  attacks: CharacterAttackDTO[];
  creatureProfile: CreatureProfileDTO | null;
  spellSlots?: SpellSlotLevel[] | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCharacterPayload = {
  name: string;
  type: CharacterType;
  race: string;
  characterClass: string;
  campaignId: string;
  background?: string;
  alignment?: Alignment;
  notes?: string | null;
  creatureProfile?: CreatureProfileInput;
};

export type UpdateCharacterPayload = Partial<{
  name: string;
  type: CharacterType;
  race: string;
  characterClass: string;
  background: string;
  alignment: Alignment;
  notes: string | null;
  experience: number;
  speed: number;
  hitDiceType: HitDiceType;
  hitDiceUsed: number;
  maxHp: number;
  currentHp: number;
  tempHp: number;
  deathSaveSuccesses: number;
  deathSaveFailures: number;
  armorClass: number;
  usesShield: boolean;
  inspiration: boolean;
  size: string | null;
  senses: string | null;
  languages: string | null;
  damageVulnerabilities: string | null;
  damageResistances: string | null;
  damageImmunities: string | null;
  conditionImmunities: string | null;
  abilityScores: CharacterAbilityDTO[];
  skills: CharacterSkillDTO[];
  attacks: CharacterAttackInput[];
  creatureProfile: CreatureProfileInput;
  spellSlots: SpellSlotLevel[] | null;
}>;
