export {
  calcModifier,
  parseDiceToSidesNumber,
  getLevelFromXp,
  getXpFromLevel,
  clamp,
  getProficiencyBonus,
  SPELL_SAVE_DC_BASE,
  SHIELD_AC_BONUS,
  XP_THRESHOLDS,
  MIN_LEVEL,
  MAX_LEVEL,
} from "../../../shared/utils/dndMath";

import { calcModifier as toModifier } from "../../../shared/utils/dndMath";

export const formatSigned = (value: number): string =>
  value >= 0 ? `+${value}` : `${value}`;

export const formatAbilityModifier = (score: number): string =>
  formatSigned(toModifier(score));
