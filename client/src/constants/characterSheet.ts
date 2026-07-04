import type {
  AbilityName,
  AbilityState,
  CharacterSheetState,
  CreatureSheetState,
  SharedSheetFields,
  SheetKind,
  SheetState,
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

const createSharedFields = (): SharedSheetFields => ({
  name: "New Character",
  race: "",
  size: "Medium",
  level: 1,

  abilities: DEFAULT_ABILITIES,
  skills: DEFAULT_SKILLS,

  ac: 10,
  usesShield: false,
  speed: 30,
  currentHp: 10,
  maxHp: 10,
  tempHp: 0,

  attacks: Array.from({ length: MIN_ATTACKS }, () => ({
    id: crypto.randomUUID(),
    name: "",
    attackBonus: "",
    damage: "",
    notes: "",
  })),

  senses: "",
  languages: "",
  damageVulnerabilities: "",
  damageResistances: "",
  damageImmunities: "",
  conditionImmunities: "",

  notes: "",
});

export const createInitialCharacterSheet = (): CharacterSheetState => ({
  kind: "character",
  ...createSharedFields(),

  characterClass: "",
  subclass: "",
  background: "",
  xp: 0,

  hitDiceType: "d8",
  hitDiceUsed: 0,
  deathSaveSuccesses: 0,
  deathSaveFailures: 0,
  inspiration: false,

  spellSlots: null,

  classFeatures: "",
  racialTraits: "",
  feats: "",

  armorProficiencies: "",
  weaponProficiencies: "",
  toolProficiencies: "",
});

export const createInitialCreatureSheet = (): CreatureSheetState => ({
  kind: "creature",
  ...createSharedFields(),

  challengeRating: null,
  traits: [],
});

export const createInitialSheetState = (kind: SheetKind): SheetState =>
  kind === "character"
    ? createInitialCharacterSheet()
    : createInitialCreatureSheet();
