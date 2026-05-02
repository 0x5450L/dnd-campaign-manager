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

export const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v));
