import {
  ENCOUNTER_MULTIPLIER_LADDER,
  ENCOUNTER_SIZE_BANDS,
  ENCOUNTER_XP_THRESHOLDS,
  LARGE_PARTY_SIZE,
  MAX_PARTY_SIZE,
  MIN_PARTY_SIZE,
  SMALL_PARTY_SIZE,
} from "../constants/encounter";
import { MAX_LEVEL, MIN_LEVEL } from "../constants/dndMath";
import type {
  EncounterBudget,
  EncounterDifficulty,
  EncounterSizeBand,
  EncounterXpReport,
} from "../types/encounter";
import { clamp } from "./dndMath";

const ladderShift = (partySize: number): number => {
  if (partySize < SMALL_PARTY_SIZE) return 1;
  if (partySize >= LARGE_PARTY_SIZE) return -1;
  return 0;
};

export const encounterMultiplier = (
  sizeBand: EncounterSizeBand,
  partySize: number,
): number => {
  const base = ENCOUNTER_SIZE_BANDS[sizeBand].ladderIndex;
  const index = clamp(
    base + ladderShift(partySize),
    0,
    ENCOUNTER_MULTIPLIER_LADDER.length - 1,
  );
  return ENCOUNTER_MULTIPLIER_LADDER[index];
};

export const encounterThresholdXp = (
  difficulty: EncounterDifficulty,
  partyLevel: number,
  partySize: number,
): number => {
  const level = clamp(Math.floor(partyLevel), MIN_LEVEL, MAX_LEVEL);
  const size = clamp(Math.floor(partySize), MIN_PARTY_SIZE, MAX_PARTY_SIZE);
  return ENCOUNTER_XP_THRESHOLDS[level - 1][difficulty] * size;
};

export const buildEncounterBudget = (
  difficulty: EncounterDifficulty,
  sizeBand: EncounterSizeBand,
  partyLevel: number,
  partySize: number,
): EncounterBudget => {
  const level = clamp(Math.floor(partyLevel), MIN_LEVEL, MAX_LEVEL);
  const size = clamp(Math.floor(partySize), MIN_PARTY_SIZE, MAX_PARTY_SIZE);
  const band = ENCOUNTER_SIZE_BANDS[sizeBand];
  const multiplier = encounterMultiplier(sizeBand, size);
  const thresholdXp = encounterThresholdXp(difficulty, level, size);

  return {
    difficulty,
    sizeBand,
    partyLevel: level,
    partySize: size,
    minCreatures: band.min,
    maxCreatures: band.max,
    multiplier,
    thresholdXp,
    rawBudgetXp: Math.round(thresholdXp / multiplier),
  };
};

const COUNT_LADDER_INDEX: { upTo: number; index: number }[] = [
  { upTo: 1, index: 1 },
  { upTo: 2, index: 2 },
  { upTo: 6, index: 3 },
  { upTo: 10, index: 4 },
  { upTo: 14, index: 5 },
];

export const encounterMultiplierForCount = (
  creatureCount: number,
  partySize: number,
): number => {
  const base =
    COUNT_LADDER_INDEX.find((row) => creatureCount <= row.upTo)?.index ??
    ENCOUNTER_MULTIPLIER_LADDER.length - 1;
  const index = clamp(
    base + ladderShift(partySize),
    0,
    ENCOUNTER_MULTIPLIER_LADDER.length - 1,
  );
  return ENCOUNTER_MULTIPLIER_LADDER[index];
};

export const buildXpReport = (
  rawXp: number,
  creatureCount: number,
  budget: EncounterBudget,
): EncounterXpReport => {
  const multiplier = encounterMultiplierForCount(
    creatureCount,
    budget.partySize,
  );
  const adjustedXp = Math.round(rawXp * multiplier);
  return {
    creatureCount,
    rawXp,
    adjustedXp,
    multiplier,
    thresholdXp: budget.thresholdXp,
    deviationRatio:
      budget.thresholdXp > 0 ? adjustedXp / budget.thresholdXp - 1 : 0,
  };
};
