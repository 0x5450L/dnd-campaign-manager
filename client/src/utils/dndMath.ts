export const calcModifier = (score: number): number =>
  Math.floor((score - 10) / 2);

export const parseDiceToSidesNumber = (type: string): number =>
  Number(type.replace("d", "")) || 8;

export const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v));
