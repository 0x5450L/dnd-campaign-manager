export {
  calcModifier,
  parseDiceToSidesNumber,
  getLevelFromXp,
  getXpFromLevel,
  getProficiencyBonus,
  XP_THRESHOLDS,
  MIN_LEVEL,
  MAX_LEVEL,
} from "../../../shared/dndMath";

import { calcModifier as toModifier } from "../../../shared/dndMath";

export const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v));

export const formatSigned = (value: number): string =>
  value >= 0 ? `+${value}` : `${value}`;

export const formatAbilityModifier = (score: number): string =>
  formatSigned(toModifier(score));
