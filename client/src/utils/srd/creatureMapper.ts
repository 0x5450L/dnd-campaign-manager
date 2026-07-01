import {
  ABILITY_NAMES,
  SKILL_DEFINITIONS,
} from "../../../../shared/constants/dnd";
import type { AbilityName } from "../../../../shared/types/dnd";
import type { SrdCreature } from "../../../../shared/dto/srd";
import type {
  AbilityState,
  CharacterSheetState,
  SkillDef,
} from "../../types/characters/characterSheet";
import { buildAttacks, buildNotes } from "./creatureNotesFormatter";

const buildAbilities = (
  creature: SrdCreature,
): Record<AbilityName, AbilityState> => {
  const result = {} as Record<AbilityName, AbilityState>;
  for (const ability of ABILITY_NAMES) {
    result[ability] = {
      score: creature.abilities[ability] ?? 10,
      saveProficient: creature.savingThrows[ability] !== undefined,
    };
  }
  return result;
};

const buildSkills = (creature: SrdCreature): SkillDef[] => {
  const proficientNames = new Set(
    Object.keys(creature.skills).map((name) => name.toLowerCase()),
  );
  return SKILL_DEFINITIONS.map((def) => ({
    name: def.name,
    ability: def.ability,
    proficient: proficientNames.has(def.name.toLowerCase()),
  }));
};

export const srdCreatureToSheetState = (
  creature: SrdCreature,
): Partial<CharacterSheetState> => ({
  name: creature.name,
  race: creature.type ?? "",
  characterClass: "",
  background: "",
  size: creature.size ?? "",
  abilities: buildAbilities(creature),
  skills: buildSkills(creature),
  ac: creature.armorClass,
  usesShield: false,
  speed: creature.speed.walk ?? 30,
  currentHp: creature.hitPoints,
  maxHp: creature.hitPoints,
  tempHp: 0,
  hitDiceType: "d8",
  hitDiceUsed: 0,
  deathSaveSuccesses: 0,
  deathSaveFailures: 0,
  inspiration: false,
  attacks: buildAttacks(creature.actions),
  spellSlots: null,
  notes: buildNotes(creature),
});
