import {
  MAX_LEVEL,
  MIN_LEVEL,
  SHIELD_AC_BONUS,
  SPELL_SAVE_DC_BASE,
  XP_THRESHOLDS,
} from "../constants/dndMath";

export {
  MAX_LEVEL,
  MIN_LEVEL,
  SHIELD_AC_BONUS,
  SPELL_SAVE_DC_BASE,
  XP_THRESHOLDS,
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const calcModifier = (score: number): number =>
  Math.floor((score - 10) / 2);

export const parseDiceToSidesNumber = (type: string): number =>
  Number(type.replace("d", "")) || 8;

export const getLevelFromXp = (xp: number): number => {
  if (xp < XP_THRESHOLDS[0]) return MIN_LEVEL;
  for (let level = MAX_LEVEL; level >= MIN_LEVEL; level--) {
    if (xp >= XP_THRESHOLDS[level - 1]) return level;
  }
  return MIN_LEVEL;
};

export const getXpFromLevel = (level: number): number => {
  const clamped = clamp(Math.floor(level), MIN_LEVEL, MAX_LEVEL);
  return XP_THRESHOLDS[clamped - 1];
};

export const getProficiencyBonus = (level: number): number =>
  Math.ceil(level / 4) + 1;
