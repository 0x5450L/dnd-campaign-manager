import { ABILITY_NAMES, SKILL_DEFINITIONS } from "../../../shared/constants/dnd";
import type { AbilityName } from "../../../shared/types/dnd";
import type { SrdMonster, SrdMonsterAction } from "../../../shared/dto/srd";
import { MIN_ATTACKS } from "../constants/characterSheet";
import type {
  AbilityState,
  Attack,
  CharacterSheetState,
  SkillDef,
} from "../types/characters/characterSheet";

export type { SrdMonster } from "../../../shared/dto/srd";

const buildAbilities = (
  monster: SrdMonster,
): Record<AbilityName, AbilityState> => {
  const result = {} as Record<AbilityName, AbilityState>;
  for (const ability of ABILITY_NAMES) {
    result[ability] = {
      score: monster.abilities[ability] ?? 10,
      saveProficient: monster.savingThrows[ability] !== undefined,
    };
  }
  return result;
};

const buildSkills = (monster: SrdMonster): SkillDef[] => {
  const proficientNames = new Set(
    Object.keys(monster.skills).map((name) => name.toLowerCase()),
  );
  return SKILL_DEFINITIONS.map((def) => ({
    name: def.name,
    ability: def.ability,
    proficient: proficientNames.has(def.name.toLowerCase()),
  }));
};

const makeEmptyAttack = (): Attack => ({
  id: crypto.randomUUID(),
  name: "",
  attackBonus: "",
  damage: "",
  notes: "",
});

const buildAttacks = (actions: SrdMonsterAction[]): Attack[] => {
  const mapped: Attack[] = actions.map((action) => ({
    id: crypto.randomUUID(),
    name: action.name,
    attackBonus: "",
    damage: "",
    notes: action.description,
  }));
  while (mapped.length < MIN_ATTACKS) {
    mapped.push(makeEmptyAttack());
  }
  return mapped;
};

const labelled = (title: string, body: string | null): string | null =>
  body && body.trim() !== "" ? `${title}: ${body}` : null;

const actionsBlock = (
  title: string,
  actions: SrdMonsterAction[],
): string | null => {
  if (actions.length === 0) {
    return null;
  }
  const lines = actions.map((a) => `• ${a.name}: ${a.description}`).join("\n");
  return `${title}\n${lines}`;
};

const buildNotes = (monster: SrdMonster): string => {
  const descriptor =
    [monster.size, monster.type, monster.alignment].filter(Boolean).join(", ") ||
    null;
  const parts = [
    labelled("Type", descriptor),
    labelled("Challenge rating", String(monster.challengeRating)),
    labelled("Senses", monster.senses),
    labelled("Languages", monster.languages),
    labelled("Damage immunities", monster.damageImmunities),
    labelled("Damage resistances", monster.damageResistances),
    labelled("Damage vulnerabilities", monster.damageVulnerabilities),
    labelled("Condition immunities", monster.conditionImmunities),
    actionsBlock("Traits", monster.specialAbilities),
    actionsBlock("Legendary actions", monster.legendaryActions),
  ];
  return parts.filter((part): part is string => part !== null).join("\n\n");
};

export const srdMonsterToSheetState = (
  monster: SrdMonster,
): Partial<CharacterSheetState> => ({
  name: monster.name,
  race: monster.type ?? "",
  characterClass: "",
  background: "",
  size: monster.size ?? "",
  abilities: buildAbilities(monster),
  skills: buildSkills(monster),
  ac: monster.armorClass,
  usesShield: false,
  speed: monster.speed.walk ?? 30,
  currentHp: monster.hitPoints,
  maxHp: monster.hitPoints,
  tempHp: 0,
  hitDiceType: "d8",
  hitDiceUsed: 0,
  deathSaveSuccesses: 0,
  deathSaveFailures: 0,
  inspiration: false,
  attacks: buildAttacks(monster.actions),
  spellSlots: null,
  notes: buildNotes(monster),
});
