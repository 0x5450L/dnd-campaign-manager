import type {
  ENCOUNTER_DIFFICULTY,
  ENCOUNTER_SIZE_BAND,
} from "../constants/encounter.js";

export type EncounterDifficulty =
  (typeof ENCOUNTER_DIFFICULTY)[keyof typeof ENCOUNTER_DIFFICULTY];

export type EncounterSizeBand =
  (typeof ENCOUNTER_SIZE_BAND)[keyof typeof ENCOUNTER_SIZE_BAND];

export type EncounterBudget = {
  difficulty: EncounterDifficulty;
  sizeBand: EncounterSizeBand;
  partyLevel: number;
  partySize: number;
  minCreatures: number;
  maxCreatures: number;
  multiplier: number;
  thresholdXp: number;
  rawBudgetXp: number;
};

export type EncounterXpReport = {
  creatureCount: number;
  rawXp: number;
  adjustedXp: number;
  multiplier: number;
  thresholdXp: number;
  deviationRatio: number;
};
