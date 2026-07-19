import type { AbilityUsageAction } from "../types/abilities";
import type { SpellSlotLevel } from "../types/dnd";

export const applySpellSlotUsage = (
  spellSlots: SpellSlotLevel[],
  level: number,
  action: AbilityUsageAction,
): SpellSlotLevel[] | null => {
  const slot = spellSlots.find((entry) => entry.level === level);
  if (!slot) return null;
  const used = action === "spend" ? slot.used + 1 : slot.used - 1;
  if (used < 0 || used > slot.total) return null;
  return spellSlots.map((entry) => (entry.level === level ? { ...entry, used } : entry));
};

export const listCastableSlotLevels = (
  spellSlots: SpellSlotLevel[],
  minLevel: number,
  action: AbilityUsageAction,
): number[] =>
  spellSlots
    .filter(
      (slot) =>
        slot.level >= minLevel &&
        (action === "spend" ? slot.used < slot.total : slot.used > 0),
    )
    .map((slot) => slot.level)
    .sort((a, b) => a - b);
