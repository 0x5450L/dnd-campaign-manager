import { describe, expect, it } from "vitest";
import type { SpellSlotLevel } from "../types/dnd.js";
import { applySpellSlotUsage, listCastableSlotLevels } from "./spellSlotUsage.js";

const slots = (): SpellSlotLevel[] => [
  { level: 1, total: 4, used: 2 },
  { level: 2, total: 3, used: 3 },
  { level: 3, total: 2, used: 0 },
];

describe("applySpellSlotUsage", () => {
  it("spends a slot at the requested level", () => {
    expect(applySpellSlotUsage(slots(), 1, "spend")).toEqual([
      { level: 1, total: 4, used: 3 },
      { level: 2, total: 3, used: 3 },
      { level: 3, total: 2, used: 0 },
    ]);
  });

  it("restores a spent slot", () => {
    expect(applySpellSlotUsage(slots(), 2, "restore")?.[1]).toEqual({
      level: 2,
      total: 3,
      used: 2,
    });
  });

  it("refuses to spend a level that is fully used", () => {
    expect(applySpellSlotUsage(slots(), 2, "spend")).toBeNull();
  });

  it("refuses to restore a level with nothing spent", () => {
    expect(applySpellSlotUsage(slots(), 3, "restore")).toBeNull();
  });

  it("refuses a level the caster does not have", () => {
    expect(applySpellSlotUsage(slots(), 9, "spend")).toBeNull();
  });

  it("refuses a non-positive count", () => {
    expect(applySpellSlotUsage(slots(), 1, "spend", 0)).toBeNull();
  });

  it("refuses a count that would overdraw the level", () => {
    expect(applySpellSlotUsage(slots(), 1, "spend", 3)).toBeNull();
  });

  it("does not mutate the input", () => {
    const input = slots();
    applySpellSlotUsage(input, 1, "spend");
    expect(input[0].used).toBe(2);
  });
});

describe("listCastableSlotLevels", () => {
  it("lists levels at or above the minimum that still have slots", () => {
    expect(listCastableSlotLevels(slots(), 1, "spend")).toEqual([1, 3]);
  });

  it("honours the minimum level for upcasting", () => {
    expect(listCastableSlotLevels(slots(), 3, "spend")).toEqual([3]);
  });

  it("lists only levels with spent slots when restoring", () => {
    expect(listCastableSlotLevels(slots(), 1, "restore")).toEqual([1, 2]);
  });

  it("returns the levels in ascending order", () => {
    const unsorted: SpellSlotLevel[] = [
      { level: 3, total: 2, used: 0 },
      { level: 1, total: 4, used: 0 },
      { level: 2, total: 3, used: 0 },
    ];
    expect(listCastableSlotLevels(unsorted, 1, "spend")).toEqual([1, 2, 3]);
  });

  it("returns nothing when every slot is exhausted", () => {
    const empty: SpellSlotLevel[] = [{ level: 1, total: 2, used: 2 }];
    expect(listCastableSlotLevels(empty, 1, "spend")).toEqual([]);
  });
});
