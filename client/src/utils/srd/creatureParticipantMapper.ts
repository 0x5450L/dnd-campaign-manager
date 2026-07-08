import { ABILITY_NAMES } from "../../../../shared/constants/dnd";
import type { SrdCreature } from "../../../../shared/dto/srd";
import type {
  EncounterParticipantDTO,
  ParticipantAbilityScore,
} from "../../types/encounter";
import type { CharacterAttackDTO } from "../../types/characters/characters";
import { parseCreatureAction } from "./creatureActionParser";

const TO_HIT_BONUS = /^[+-]\d+$/;

type ParticipantSeed = Pick<
  EncounterParticipantDTO,
  "type" | "name" | "maxHp" | "currentHp" | "armorClass" | "abilityScores" | "attacks"
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

export const srdCreatureToParticipant = (creature: SrdCreature): ParticipantSeed => ({
  type: "monster",
  name: creature.name,
  maxHp: creature.hitPoints,
  currentHp: creature.hitPoints,
  armorClass: creature.armorClass,
  abilityScores: buildAbilityScores(creature),
  attacks: buildAttacks(creature),
});
