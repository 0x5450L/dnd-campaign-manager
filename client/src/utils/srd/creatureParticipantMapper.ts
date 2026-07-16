import { ABILITY_NAMES } from "@shared/constants/dnd";
import type { SrdCreature } from "@shared/dto/srd";
import type {
  EncounterParticipantDTO,
  ParticipantAbilityScore,
} from "@/types/encounter";
import type { CharacterAttackDTO } from "@/types/characters/characters";
import { parseCreatureAction } from "./creatureActionParser";
import {
  creatureAbilities,
  creatureResourcePools,
} from "./abilities";

const TO_HIT_BONUS = /^[+-]\d+$/;

type ParticipantSeed = Pick<
  EncounterParticipantDTO,
  | "type"
  | "name"
  | "maxHp"
  | "currentHp"
  | "armorClass"
  | "abilityScores"
  | "attacks"
  | "speed"
  | "senses"
  | "challengeRating"
  | "damageVulnerabilities"
  | "damageResistances"
  | "damageImmunities"
  | "conditionImmunities"
  | "abilities"
  | "resources"
>;

const buildAbilityScores = (creature: SrdCreature): ParticipantAbilityScore[] =>
  ABILITY_NAMES.map((name) => ({ name, score: creature.abilities[name] ?? 10 }));

const buildAttacks = (creature: SrdCreature): CharacterAttackDTO[] => {
  const attacks: CharacterAttackDTO[] = [];
  for (const action of creature.actions) {
    const parsed = parseCreatureAction(action.description);
    if (!TO_HIT_BONUS.test(parsed.attackBonus)) continue;
    attacks.push({
      id: crypto.randomUUID(),
      name: action.name,
      attackBonus: Number(parsed.attackBonus),
      damage: parsed.damage,
      notes: parsed.notes.length > 0 ? parsed.notes : null,
    });
  }
  return attacks;
};

const formatSpeed = (speed: SrdCreature["speed"]): string | null => {
  const entries = Object.entries(speed).filter(([, value]) => typeof value === "number");
  if (entries.length === 0) return null;
  const walk = entries.find(([mode]) => mode === "walk");
  const rest = entries.filter(([mode]) => mode !== "walk");
  const parts = walk ? [`${walk[1]} ft.`] : [];
  for (const [mode, value] of rest) parts.push(`${mode} ${value} ft.`);
  return parts.join(", ");
};

export const srdCreatureToParticipant = (creature: SrdCreature): ParticipantSeed => {
  const abilities = creatureAbilities(creature);
  const resources = creatureResourcePools(creature);

  return {
    type: "monster",
    name: creature.name,
    maxHp: creature.hitPoints,
    currentHp: creature.hitPoints,
    armorClass: creature.armorClass,
    abilityScores: buildAbilityScores(creature),
    attacks: buildAttacks(creature),
    speed: formatSpeed(creature.speed),
    senses: creature.senses,
    challengeRating: creature.challengeRating,
    damageVulnerabilities: creature.damageVulnerabilities,
    damageResistances: creature.damageResistances,
    damageImmunities: creature.damageImmunities,
    conditionImmunities: creature.conditionImmunities,
    abilities: abilities.length > 0 ? abilities : null,
    resources: resources.length > 0 ? resources : null,
  };
};
