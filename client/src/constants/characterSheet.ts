import type {
  AbilityName,
  AbilityState,
  CharacterSheetState,
  SkillDef,
} from "../types/characters/characterSheet";
import { SKILL_DEFINITIONS } from "../../../shared/constants/dnd";

export const MIN_ATTACKS = 3;

export const DEFAULT_SKILLS: SkillDef[] = SKILL_DEFINITIONS.map((s) => ({
  name: s.name,
  ability: s.ability,
  proficient: false,
}));

export const DEFAULT_ABILITIES: Record<AbilityName, AbilityState> = {
  str: { score: 10, saveProficient: false },
  dex: { score: 10, saveProficient: false },
  con: { score: 10, saveProficient: false },
  int: { score: 10, saveProficient: false },
  wis: { score: 10, saveProficient: false },
  cha: { score: 10, saveProficient: false },
};

export const createInitialCharacterSheet = (): CharacterSheetState => ({
  name: "New Character",
  race: "",
  characterClass: "",
  level: 1,
  background: "",
  subclass: "",
  xp: 0,

  abilities: DEFAULT_ABILITIES,
  skills: DEFAULT_SKILLS,

  ac: 10,
  usesShield: false,
  speed: 30,
  size: "Medium",
  currentHp: 10,
  maxHp: 10,
  tempHp: 0,
  hitDiceType: "d8",
  hitDiceUsed: 0,
  deathSaveSuccesses: 0,
  deathSaveFailures: 0,
  inspiration: false,

  attacks: Array.from({ length: MIN_ATTACKS }, () => ({
    id: crypto.randomUUID(),
    name: "",
    attackBonus: "",
    damage: "",
    notes: "",
  })),

  spellSlots: null,

  challengeRating: null,
  senses: "",
  languages: "",
  damageVulnerabilities: "",
  damageResistances: "",
  damageImmunities: "",
  conditionImmunities: "",
  traits: [],

  classFeatures: "",
  racialTraits: "",
  feats: "",
  notes: "",

  armorProficiencies: "",
  weaponProficiencies: "",
  toolProficiencies: "",
});
