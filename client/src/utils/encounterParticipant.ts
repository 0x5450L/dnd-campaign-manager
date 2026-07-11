import { clamp } from "./dndMath";
import type {
  EncounterParticipantDTO,
  UpdateParticipantPayload,
} from "../types/encounter";

type HpState = {
  currentHp: number;
  maxHp: number;
  tempHp: number;
};

type DeathSaveState = {
  deathSaveSuccesses: number;
  deathSaveFailures: number;
};

const MAX_DEATH_SAVES = 3;

export const applyDamage = (hp: HpState, amount: number): HpState => {
  const damage = Math.max(0, amount);
  const absorbedByTemp = Math.min(damage, hp.tempHp);
  return {
    ...hp,
    tempHp: hp.tempHp - absorbedByTemp,
    currentHp: clamp(hp.currentHp - (damage - absorbedByTemp), 0, hp.maxHp),
  };
};

export const applyHealing = (hp: HpState, amount: number): HpState => ({
  ...hp,
  currentHp: clamp(hp.currentHp + Math.max(0, amount), 0, hp.maxHp),
});

export const applyTempHp = (hp: HpState, amount: number): HpState => ({
  ...hp,
  tempHp: Math.max(hp.tempHp, Math.max(0, amount)),
});

export const toggleConditionInList = (
  conditions: string[],
  condition: string,
): string[] =>
  conditions.includes(condition)
    ? conditions.filter((c) => c !== condition)
    : [...conditions, condition];

export const incrementDeathSave = (
  saves: DeathSaveState,
  outcome: "success" | "failure",
): DeathSaveState => ({
  deathSaveSuccesses:
    outcome === "success"
      ? Math.min(MAX_DEATH_SAVES, saves.deathSaveSuccesses + 1)
      : saves.deathSaveSuccesses,
  deathSaveFailures:
    outcome === "failure"
      ? Math.min(MAX_DEATH_SAVES, saves.deathSaveFailures + 1)
      : saves.deathSaveFailures,
});

const SCALAR_FIELDS = [
  "name",
  "sortOrder",
  "maxHp",
  "currentHp",
  "tempHp",
  "armorClass",
  "isVisible",
  "acHidden",
  "usesShield",
  "spellAbility",
  "proficiencyBonus",
  "deathSaveSuccesses",
  "deathSaveFailures",
  "speed",
  "senses",
  "challengeRating",
  "damageVulnerabilities",
  "damageResistances",
  "damageImmunities",
  "conditionImmunities",
] as const;

const JSON_FIELDS = [
  "conditions",
  "abilityScores",
  "spellSlots",
  "attacks",
  "abilities",
  "resources",
] as const;

export const diffParticipant = (
  base: EncounterParticipantDTO,
  next: EncounterParticipantDTO,
): UpdateParticipantPayload => {
  const patch: Record<string, unknown> = {};
  for (const field of SCALAR_FIELDS) {
    if (next[field] !== base[field]) patch[field] = next[field];
  }
  for (const field of JSON_FIELDS) {
    if (JSON.stringify(next[field]) !== JSON.stringify(base[field])) {
      patch[field] = next[field];
    }
  }
  return patch as UpdateParticipantPayload;
};
