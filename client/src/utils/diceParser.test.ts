import { describe, expect, it, vi } from "vitest";
import {
  DiceParseError,
  addDieToFormula,
  applyAdvDis,
  formatTerms,
  parseDiceFormula,
  rollTerms,
} from "./diceParser";
import type { DiceTerm } from "../types/dice";

vi.mock("@dnd/shared/utils/dice", () => ({
  rollDie: vi.fn(),
}));

const { rollDie } = await import("@dnd/shared/utils/dice");
const nextRolls = (...values: number[]) => {
  const queue = [...values];
  vi.mocked(rollDie).mockImplementation(() => queue.shift() ?? 1);
};

describe("reading a formula", () => {
  it("reads a bare die as one of it", () => {
    expect(parseDiceFormula("d20")).toEqual([
      { kind: "dice", count: 1, sides: 20, sign: 1, keep: undefined },
    ]);
  });

  it("reads a count in front of the die", () => {
    expect(parseDiceFormula("3d6")).toEqual([
      { kind: "dice", count: 3, sides: 6, sign: 1, keep: undefined },
    ]);
  });

  it("reads a bare number as a modifier", () => {
    expect(parseDiceFormula("5")).toEqual([{ kind: "modifier", value: 5 }]);
  });

  it("keeps every term of a mixed formula in order", () => {
    expect(parseDiceFormula("2d8+1d4+3")).toEqual([
      { kind: "dice", count: 2, sides: 8, sign: 1, keep: undefined },
      { kind: "dice", count: 1, sides: 4, sign: 1, keep: undefined },
      { kind: "modifier", value: 3 },
    ]);
  });

  it("carries a minus into the term that follows it", () => {
    expect(parseDiceFormula("d20-2")).toEqual([
      { kind: "dice", count: 1, sides: 20, sign: 1, keep: undefined },
      { kind: "modifier", value: -2 },
    ]);
  });

  it("lets the whole formula open with a minus", () => {
    expect(parseDiceFormula("-d6")).toEqual([
      { kind: "dice", count: 1, sides: 6, sign: -1, keep: undefined },
    ]);
  });

  it("ignores whitespace anywhere in the formula", () => {
    expect(parseDiceFormula("  2 d 6  +  1 ")).toEqual(parseDiceFormula("2d6+1"));
  });

  it("does not care about the case of the die letter", () => {
    expect(parseDiceFormula("2D6")).toEqual(parseDiceFormula("2d6"));
  });

  it("reads keep-highest and keep-lowest", () => {
    expect(parseDiceFormula("4d6kh3")).toEqual([
      { kind: "dice", count: 4, sides: 6, sign: 1, keep: { kind: "kh", n: 3 } },
    ]);
    expect(parseDiceFormula("2d20kl1")).toEqual([
      { kind: "dice", count: 2, sides: 20, sign: 1, keep: { kind: "kl", n: 1 } },
    ]);
  });
});

describe("refusing a formula", () => {
  it("refuses an empty one", () => {
    expect(() => parseDiceFormula("")).toThrow(DiceParseError);
    expect(() => parseDiceFormula("   ")).toThrow(DiceParseError);
  });

  it("refuses two signs in a row", () => {
    expect(() => parseDiceFormula("d6++1")).toThrow(DiceParseError);
  });

  it("refuses a token that is neither a die nor a number", () => {
    expect(() => parseDiceFormula("2x6")).toThrow(/Unknown token/);
    expect(() => parseDiceFormula("fireball")).toThrow(/Unknown token/);
  });

  it("refuses a die that does not exist on the table", () => {
    expect(() => parseDiceFormula("1d7")).toThrow(/not supported/);
    expect(() => parseDiceFormula("1d3")).toThrow(/not supported/);
  });

  it("refuses more dice than anyone would roll by hand", () => {
    expect(() => parseDiceFormula("101d6")).toThrow(/1\.\.100/);
    expect(() => parseDiceFormula("0d6")).toThrow(/1\.\.100/);
  });

  it("refuses keeping more dice than were rolled", () => {
    expect(() => parseDiceFormula("2d6kh3")).toThrow(/kh\/kl/);
    expect(() => parseDiceFormula("2d6kh0")).toThrow(/kh\/kl/);
  });

  it("accepts the boundaries it advertises", () => {
    expect(() => parseDiceFormula("100d6")).not.toThrow();
    expect(() => parseDiceFormula("1d100")).not.toThrow();
    expect(() => parseDiceFormula("4d6kh4")).not.toThrow();
  });
});

describe("advantage and disadvantage", () => {
  const d20: DiceTerm[] = [{ kind: "dice", count: 1, sides: 20, sign: 1 }];

  it("turns a single d20 into two, keeping the higher one", () => {
    expect(applyAdvDis(d20, "advantage")).toEqual([
      { kind: "dice", count: 2, sides: 20, sign: 1, keep: { kind: "kh", n: 1 } },
    ]);
  });

  it("keeps the lower one for disadvantage", () => {
    expect(applyAdvDis(d20, "disadvantage")).toEqual([
      { kind: "dice", count: 2, sides: 20, sign: 1, keep: { kind: "kl", n: 1 } },
    ]);
  });

  it("leaves the formula alone on a normal roll", () => {
    expect(applyAdvDis(d20, "normal")).toEqual(d20);
  });

  it("does not touch dice that are not a d20", () => {
    const d6: DiceTerm[] = [{ kind: "dice", count: 1, sides: 6, sign: 1 }];
    expect(applyAdvDis(d6, "advantage")).toEqual(d6);
  });

  it("does not touch a d20 pool that is already more than one die", () => {
    const pool: DiceTerm[] = [{ kind: "dice", count: 3, sides: 20, sign: 1 }];
    expect(applyAdvDis(pool, "advantage")).toEqual(pool);
  });

  it("does not touch a d20 that already keeps something", () => {
    const kept: DiceTerm[] = [
      { kind: "dice", count: 2, sides: 20, sign: 1, keep: { kind: "kl", n: 1 } },
    ];
    expect(applyAdvDis(kept, "advantage")).toEqual(kept);
  });

  it("leaves the modifiers of a mixed formula untouched", () => {
    const mixed = parseDiceFormula("d20+5");
    expect(applyAdvDis(mixed, "advantage")[1]).toEqual({ kind: "modifier", value: 5 });
  });
});

describe("rolling", () => {
  it("adds the dice and the modifier together", () => {
    nextRolls(3, 4);
    const result = rollTerms(parseDiceFormula("2d6+2"), "2d6+2");
    expect(result.total).toBe(9);
  });

  it("subtracts a term that carries a minus", () => {
    nextRolls(4);
    const result = rollTerms(parseDiceFormula("10-1d6"), "10-1d6");
    expect(result.total).toBe(6);
  });

  it("drops the dice it was told not to keep", () => {
    nextRolls(2, 5, 6, 1);
    const result = rollTerms(parseDiceFormula("4d6kh3"), "4d6kh3");
    expect(result.total).toBe(13);
  });

  it("marks the dropped die rather than hiding it", () => {
    nextRolls(2, 5, 6, 1);
    const [term] = rollTerms(parseDiceFormula("4d6kh3"), "4d6kh3").terms;
    if (term.kind !== "dice") throw new Error("expected a dice term");
    expect(term.rolls.map((r) => r.dropped)).toEqual([false, false, false, true]);
  });

  it("calls a natural twenty a critical success", () => {
    nextRolls(20);
    expect(rollTerms(parseDiceFormula("d20"), "d20").critSuccess).toBe(true);
  });

  it("calls a natural one a critical failure", () => {
    nextRolls(1);
    expect(rollTerms(parseDiceFormula("d20"), "d20").critFail).toBe(true);
  });

  it("reads the crit off the die that was kept, not the one that was dropped", () => {
    nextRolls(20, 7);
    const result = rollTerms(parseDiceFormula("2d20kl1"), "2d20kl1");
    expect(result.critSuccess).toBe(false);
    expect(result.total).toBe(7);
  });

  it("never calls a twenty on another die a crit", () => {
    nextRolls(20);
    expect(rollTerms(parseDiceFormula("d100"), "d100").critSuccess).toBe(false);
  });

  it("carries the label through to the result", () => {
    nextRolls(4);
    expect(rollTerms(parseDiceFormula("d6"), "d6", "Sneak attack").label).toBe(
      "Sneak attack",
    );
  });
});

describe("writing a formula back out", () => {
  it("round-trips what it read", () => {
    for (const formula of ["2d6 + 3", "1d20 + 5", "4d6kh3", "3d8 - 2"]) {
      expect(formatTerms(parseDiceFormula(formula))).toBe(formula);
    }
  });

  it("spells out the count the writer left off", () => {
    expect(formatTerms(parseDiceFormula("d20+5"))).toBe("1d20 + 5");
  });

  it("writes nothing for no terms", () => {
    expect(formatTerms([])).toBe("");
  });

  it("keeps a leading minus in front rather than as a subtraction", () => {
    expect(formatTerms(parseDiceFormula("-2d6"))).toBe("-2d6");
    expect(formatTerms(parseDiceFormula("-3"))).toBe("-3");
  });
});

describe("adding a die with the buttons", () => {
  it("starts a formula from nothing", () => {
    expect(addDieToFormula("", "d20")).toBe("1d20");
  });

  it("grows the pool that is already there instead of appending another term", () => {
    expect(addDieToFormula("1d6", "d6")).toBe("2d6");
  });

  it("appends a new term for a die of another kind", () => {
    expect(addDieToFormula("1d6", "d8")).toBe("1d6 + 1d8");
  });

  it("leaves a pool that keeps dice alone and starts a fresh one", () => {
    expect(addDieToFormula("4d6kh3", "d6")).toBe("4d6kh3 + 1d6");
  });

  it("stops at the hundred the parser would refuse anyway", () => {
    expect(addDieToFormula("100d6", "d6")).toBe("100d6");
  });

  it("starts over rather than throwing when the box holds nonsense", () => {
    expect(addDieToFormula("fireball", "d4")).toBe("1d4");
  });
});
