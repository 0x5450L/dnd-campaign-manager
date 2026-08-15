import { describe, expect, it } from "vitest";
import {
  MAX_LEVEL,
  XP_THRESHOLDS,
  calcModifier,
  challengeRatingLabel,
  clamp,
  getLevelFromXp,
  getProficiencyBonus,
  getXpFromLevel,
  parseDiceToSidesNumber,
  xpForChallengeRating,
} from "./dndMath.js";

describe("clamp", () => {
  it("passes a value inside the range through untouched", () => {
    expect(clamp(5, 1, 10)).toBe(5);
  });

  it("pins values to the nearest bound", () => {
    expect(clamp(-3, 1, 10)).toBe(1);
    expect(clamp(42, 1, 10)).toBe(10);
  });
});

describe("calcModifier", () => {
  it("scores 10 and 11 both give no modifier", () => {
    expect(calcModifier(10)).toBe(0);
    expect(calcModifier(11)).toBe(0);
  });

  it("rounds down for odd scores below 10", () => {
    expect(calcModifier(9)).toBe(-1);
    expect(calcModifier(7)).toBe(-2);
  });

  it("matches the SRD table at the extremes", () => {
    expect(calcModifier(1)).toBe(-5);
    expect(calcModifier(20)).toBe(5);
    expect(calcModifier(30)).toBe(10);
  });
});

describe("getLevelFromXp", () => {
  it("floors below the first threshold to level 1", () => {
    expect(getLevelFromXp(-100)).toBe(1);
    expect(getLevelFromXp(0)).toBe(1);
    expect(getLevelFromXp(299)).toBe(1);
  });

  it("levels up exactly on a threshold", () => {
    expect(getLevelFromXp(300)).toBe(2);
    expect(getLevelFromXp(900)).toBe(3);
  });

  it("caps at level 20 no matter how much XP is banked", () => {
    expect(getLevelFromXp(999_999)).toBe(MAX_LEVEL);
  });

  it("round-trips against getXpFromLevel for every level", () => {
    for (let level = 1; level <= MAX_LEVEL; level++) {
      expect(getLevelFromXp(getXpFromLevel(level))).toBe(level);
    }
  });
});

describe("getXpFromLevel", () => {
  it("clamps out-of-range levels into the table", () => {
    expect(getXpFromLevel(0)).toBe(XP_THRESHOLDS[0]);
    expect(getXpFromLevel(99)).toBe(XP_THRESHOLDS[MAX_LEVEL - 1]);
  });

  it("truncates fractional levels", () => {
    expect(getXpFromLevel(3.9)).toBe(XP_THRESHOLDS[2]);
  });
});

describe("getProficiencyBonus", () => {
  it("follows the SRD progression at every step boundary", () => {
    expect(getProficiencyBonus(1)).toBe(2);
    expect(getProficiencyBonus(4)).toBe(2);
    expect(getProficiencyBonus(5)).toBe(3);
    expect(getProficiencyBonus(8)).toBe(3);
    expect(getProficiencyBonus(9)).toBe(4);
    expect(getProficiencyBonus(13)).toBe(5);
    expect(getProficiencyBonus(17)).toBe(6);
    expect(getProficiencyBonus(20)).toBe(6);
  });
});

describe("parseDiceToSidesNumber", () => {
  it("reads the side count out of a die name", () => {
    expect(parseDiceToSidesNumber("d20")).toBe(20);
    expect(parseDiceToSidesNumber("d6")).toBe(6);
  });

  it("falls back to d8 for unparseable input", () => {
    expect(parseDiceToSidesNumber("")).toBe(8);
    expect(parseDiceToSidesNumber("dX")).toBe(8);
  });
});

describe("challenge ratings", () => {
  it("maps fractional ratings to their XP award", () => {
    expect(xpForChallengeRating(0.25)).toBe(50);
    expect(xpForChallengeRating(1)).toBe(200);
  });

  it("renders fractional ratings as fractions", () => {
    expect(challengeRatingLabel(0.125)).toBe("1/8");
    expect(challengeRatingLabel(0.5)).toBe("1/2");
  });

  it("returns null for a rating outside the table", () => {
    expect(xpForChallengeRating(null)).toBeNull();
    expect(xpForChallengeRating(0.3)).toBeNull();
    expect(challengeRatingLabel(0.3)).toBeNull();
  });
});
