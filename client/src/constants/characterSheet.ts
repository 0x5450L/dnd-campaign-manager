import type {
  AbilityName,
  AbilityState,
  CharacterSheetState,
  SkillDef,
} from "../types/characters/characterSheet";

export const MIN_ATTACKS = 3;

export const DEFAULT_SKILLS: SkillDef[] = [
  { name: "Athletics", ability: "str", proficient: false },
  { name: "Acrobatics", ability: "dex", proficient: false },
  { name: "Sleight of Hand", ability: "dex", proficient: false },
  { name: "Stealth", ability: "dex", proficient: false },
  { name: "Arcana", ability: "int", proficient: false },
  { name: "History", ability: "int", proficient: false },
  { name: "Investigation", ability: "int", proficient: false },
  { name: "Nature", ability: "int", proficient: false },
  { name: "Religion", ability: "int", proficient: false },
  { name: "Animal Handling", ability: "wis", proficient: false },
  { name: "Insight", ability: "wis", proficient: false },
  { name: "Medicine", ability: "wis", proficient: false },
  { name: "Perception", ability: "wis", proficient: false },
  { name: "Survival", ability: "wis", proficient: false },
  { name: "Deception", ability: "cha", proficient: false },
  { name: "Intimidation", ability: "cha", proficient: false },
  { name: "Performance", ability: "cha", proficient: false },
  { name: "Persuasion", ability: "cha", proficient: false },
];

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

  classFeatures: "",
  racialTraits: "",
  feats: "",
  notes: "",

  armorProficiencies: "",
  weaponProficiencies: "",
  toolProficiencies: "",
});
