import {
  ABILITY_NAMES,
  SKILL_DEFINITIONS,
} from "../../../../shared/constants/dnd";
import type { AbilityName } from "../../../../shared/types/dnd";
import type { SrdCreature, SrdCreatureAction } from "../../../../shared/dto/srd";
import type {
  AbilityState,
  CreatureSheetState,
  CreatureTrait,
  CreatureTraitKind,
  SkillDef,
} from "../../types/characters/characterSheet";
import { createInitialCreatureSheet } from "../../constants/characterSheet";
import { splitCreatureActions } from "./creatureActionParser";
import { buildNotes } from "./creatureNotesFormatter";

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

const toTraits = (
  actions: SrdCreatureAction[],
  kind: CreatureTraitKind,
): CreatureTrait[] =>
  actions.map((action) => ({
    id: crypto.randomUUID(),
    kind,
    name: action.name,
    description: action.description,
  }));

export const srdCreatureToSheetState = (
  creature: SrdCreature,
): CreatureSheetState => {
  const { attacks, nonAttackActions } = splitCreatureActions(creature.actions);
  return {
    ...createInitialCreatureSheet(),
    name: creature.name,
    race: creature.type ?? "",
    size: creature.size ?? "",
    abilities: buildAbilities(creature),
    skills: buildSkills(creature),
    ac: creature.armorClass,
    usesShield: false,
    speed: creature.speed.walk ?? 30,
    currentHp: creature.hitPoints,
    maxHp: creature.hitPoints,
    tempHp: 0,
    attacks,
    challengeRating: creature.challengeRating,
    senses: creature.senses ?? "",
    languages: creature.languages ?? "",
    damageVulnerabilities: creature.damageVulnerabilities ?? "",
    damageResistances: creature.damageResistances ?? "",
    damageImmunities: creature.damageImmunities ?? "",
    conditionImmunities: creature.conditionImmunities ?? "",
    traits: [
      ...toTraits(creature.specialAbilities, "trait"),
      ...toTraits(nonAttackActions, "trait"),
      ...toTraits(creature.legendaryActions, "legendary_action"),
    ],
    notes: buildNotes(creature),
  };
};
