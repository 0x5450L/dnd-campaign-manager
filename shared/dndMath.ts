export const XP_THRESHOLDS = [
  0,       // level 1
  300,     // level 2
  900,     // level 3
  2700,    // level 4
  6500,    // level 5
  14000,   // level 6
  23000,   // level 7
  34000,   // level 8
  48000,   // level 9
  64000,   // level 10
  85000,   // level 11
  100000,  // level 12
  120000,  // level 13
  140000,  // level 14
  165000,  // level 15
  195000,  // level 16
  225000,  // level 17
  265000,  // level 18
  305000,  // level 19
  355000,  // level 20
] as const;

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 20;

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
  const clamped = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, Math.floor(level)));
  return XP_THRESHOLDS[clamped - 1];
};

export const getProficiencyBonus = (level: number): number =>
  Math.ceil(level / 4) + 1;
