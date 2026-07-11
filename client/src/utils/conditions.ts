import { CONDITIONS, CONDITION_THEME } from "../constants/conditions";
import type { ConditionName } from "../types/conditions";

export const isKnownCondition = (value: string): value is ConditionName =>
  (CONDITIONS as readonly string[]).includes(value);

export const buildConditionBackground = (active: string[]): string | undefined => {
  const known = active.filter(isKnownCondition);
  if (known.length === 0) return undefined;
  if (known.length === 1) {
    return `linear-gradient(135deg, ${CONDITION_THEME[known[0]].fillRgba}, transparent 75%)`;
  }
  const stops = known
    .map((c, idx) => {
      const pct = Math.round((idx / (known.length - 1)) * 100);
      return `${CONDITION_THEME[c].fillRgba} ${pct}%`;
    })
    .join(", ");
  return `linear-gradient(135deg, ${stops})`;
};
