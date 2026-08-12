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

export const SPELL_SAVE_DC_BASE = 8;

export const SHIELD_AC_BONUS = 2;

export const CHALLENGE_RATINGS = [
  { value: 0, label: "0", xp: 10 },
  { value: 0.125, label: "1/8", xp: 25 },
  { value: 0.25, label: "1/4", xp: 50 },
  { value: 0.5, label: "1/2", xp: 100 },
  { value: 1, label: "1", xp: 200 },
  { value: 2, label: "2", xp: 450 },
  { value: 3, label: "3", xp: 700 },
  { value: 4, label: "4", xp: 1100 },
  { value: 5, label: "5", xp: 1800 },
  { value: 6, label: "6", xp: 2300 },
  { value: 7, label: "7", xp: 2900 },
  { value: 8, label: "8", xp: 3900 },
  { value: 9, label: "9", xp: 5000 },
  { value: 10, label: "10", xp: 5900 },
  { value: 11, label: "11", xp: 7200 },
  { value: 12, label: "12", xp: 8400 },
  { value: 13, label: "13", xp: 10000 },
  { value: 14, label: "14", xp: 11500 },
  { value: 15, label: "15", xp: 13000 },
  { value: 16, label: "16", xp: 15000 },
  { value: 17, label: "17", xp: 18000 },
  { value: 18, label: "18", xp: 20000 },
  { value: 19, label: "19", xp: 22000 },
  { value: 20, label: "20", xp: 25000 },
  { value: 21, label: "21", xp: 33000 },
  { value: 22, label: "22", xp: 41000 },
  { value: 23, label: "23", xp: 50000 },
  { value: 24, label: "24", xp: 62000 },
  { value: 25, label: "25", xp: 75000 },
  { value: 26, label: "26", xp: 90000 },
  { value: 27, label: "27", xp: 105000 },
  { value: 28, label: "28", xp: 120000 },
  { value: 29, label: "29", xp: 135000 },
  { value: 30, label: "30", xp: 155000 },
] as const;
