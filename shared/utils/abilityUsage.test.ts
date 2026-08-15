import { describe, expect, it } from "vitest";
import type { Ability, ResourcePool } from "../types/abilities.js";
import type { SpellSlotLevel } from "../types/dnd.js";
import { applyAbilityUsage, applyTurnStart, canApplyAbilityUsage } from "./abilityUsage.js";

const ability = (id: string, cost: Ability["cost"]): Ability => ({
  id,
  name: id,
  description: "",
  activation: "action",
  cost,
});

const breathWeapon = () =>
  ability("breath", { type: "recharge", threshold: 5, charged: true });
const secondWind = () => ability("wind", { type: "perDay", max: 2, remaining: 1 });
const ki = () => ability("flurry", { type: "pool", pool: "ki", amount: 2 });
const fireball = () => ability("fireball", { type: "spellSlot", level: 3 });
const passive = () => ability("darkvision", null);

const kiPool = (): ResourcePool[] => [
  { key: "ki", label: "Ki", max: 5, remaining: 3, resetOn: "shortRest" },
];

const slots = (): SpellSlotLevel[] => [
  { level: 3, total: 2, used: 0 },
  { level: 4, total: 1, used: 0 },
];

describe("applyAbilityUsage", () => {
  it("returns null for an unknown ability", () => {
    expect(applyAbilityUsage([], [], [], "missing", "spend")).toBeNull();
  });

  it("returns null for an ability that costs nothing", () => {
    expect(applyAbilityUsage([passive()], [], [], "darkvision", "spend")).toBeNull();
  });

  describe("recharge costs", () => {
    it("discharges a charged ability", () => {
      const result = applyAbilityUsage([breathWeapon()], [], [], "breath", "spend");
      expect(result?.abilities[0].cost).toEqual({
        type: "recharge",
        threshold: 5,
        charged: false,
      });
    });

    it("refuses to spend an ability that is already discharged", () => {
      const spent = ability("breath", { type: "recharge", threshold: 5, charged: false });
      expect(applyAbilityUsage([spent], [], [], "breath", "spend")).toBeNull();
    });

    it("refuses to restore an ability that is already charged", () => {
      expect(applyAbilityUsage([breathWeapon()], [], [], "breath", "restore")).toBeNull();
    });
  });

  describe("per-day costs", () => {
    it("decrements the remaining uses", () => {
      const result = applyAbilityUsage([secondWind()], [], [], "wind", "spend");
      expect(result?.abilities[0].cost).toMatchObject({ remaining: 0 });
    });

    it("refuses to spend past zero", () => {
      const drained = ability("wind", { type: "perDay", max: 2, remaining: 0 });
      expect(applyAbilityUsage([drained], [], [], "wind", "spend")).toBeNull();
    });

    it("refuses to restore past the maximum", () => {
      const full = ability("wind", { type: "perDay", max: 2, remaining: 2 });
      expect(applyAbilityUsage([full], [], [], "wind", "restore")).toBeNull();
    });
  });

  describe("pool costs", () => {
    it("draws the cost amount from the pool", () => {
      const result = applyAbilityUsage([ki()], kiPool(), [], "flurry", "spend");
      expect(result?.resources[0].remaining).toBe(1);
    });

    it("returns the cost amount to the pool", () => {
      const result = applyAbilityUsage([ki()], kiPool(), [], "flurry", "restore");
      expect(result?.resources[0].remaining).toBe(5);
    });

    it("refuses to overdraw the pool", () => {
      const nearlyEmpty: ResourcePool[] = [
        { key: "ki", label: "Ki", max: 5, remaining: 1, resetOn: "shortRest" },
      ];
      expect(applyAbilityUsage([ki()], nearlyEmpty, [], "flurry", "spend")).toBeNull();
    });

    it("refuses to overfill the pool", () => {
      const full: ResourcePool[] = [
        { key: "ki", label: "Ki", max: 5, remaining: 5, resetOn: "shortRest" },
      ];
      expect(applyAbilityUsage([ki()], full, [], "flurry", "restore")).toBeNull();
    });

    it("returns null when the referenced pool does not exist", () => {
      expect(applyAbilityUsage([ki()], [], [], "flurry", "spend")).toBeNull();
    });
  });

  describe("spell slot costs", () => {
    it("defaults to the lowest slot that can carry the spell", () => {
      const result = applyAbilityUsage([fireball()], [], slots(), "fireball", "spend");
      expect(result?.spellSlots).toEqual([
        { level: 3, total: 2, used: 1 },
        { level: 4, total: 1, used: 0 },
      ]);
    });

    it("upcasts into the explicitly requested slot", () => {
      const result = applyAbilityUsage([fireball()], [], slots(), "fireball", "spend", 4);
      expect(result?.spellSlots?.[1]).toEqual({ level: 4, total: 1, used: 1 });
    });

    it("refuses to cast below the spell's own level", () => {
      expect(
        applyAbilityUsage([fireball()], [], slots(), "fireball", "spend", 2),
      ).toBeNull();
    });

    it("returns null when no slot of a high enough level remains", () => {
      const drained: SpellSlotLevel[] = [
        { level: 3, total: 2, used: 2 },
        { level: 4, total: 1, used: 1 },
      ];
      expect(applyAbilityUsage([fireball()], [], drained, "fireball", "spend")).toBeNull();
    });
  });

  it("leaves the untouched buckets referentially intact", () => {
    const resources = kiPool();
    const spellSlots = slots();
    const result = applyAbilityUsage(
      [breathWeapon()],
      resources,
      spellSlots,
      "breath",
      "spend",
    );
    expect(result?.resources).toBe(resources);
    expect(result?.spellSlots).toBe(spellSlots);
  });
});

describe("canApplyAbilityUsage", () => {
  it("agrees with applyAbilityUsage on a legal action", () => {
    expect(canApplyAbilityUsage([breathWeapon()], [], [], "breath", "spend")).toBe(true);
  });

  it("agrees with applyAbilityUsage on an illegal action", () => {
    expect(canApplyAbilityUsage([breathWeapon()], [], [], "breath", "restore")).toBe(false);
  });
});

describe("applyTurnStart", () => {
  const alwaysRecharges = () => 6;
  const neverRecharges = () => 1;

  it("rerolls discharged recharge abilities and records the roll", () => {
    const spent = ability("breath", { type: "recharge", threshold: 5, charged: false });
    const result = applyTurnStart([spent], [], alwaysRecharges);

    expect(result.rechargeRolls).toEqual([
      { abilityId: "breath", abilityName: "breath", roll: 6, threshold: 5, charged: true },
    ]);
    expect(result.abilities[0].cost).toMatchObject({ charged: true });
    expect(result.changed).toBe(true);
  });

  it("reports a failed recharge without changing the ability", () => {
    const spent = ability("breath", { type: "recharge", threshold: 5, charged: false });
    const result = applyTurnStart([spent], [], neverRecharges);

    expect(result.rechargeRolls[0].charged).toBe(false);
    expect(result.abilities[0].cost).toMatchObject({ charged: false });
    expect(result.changed).toBe(false);
  });

  it("does not roll for abilities that are already charged", () => {
    const result = applyTurnStart([breathWeapon()], [], alwaysRecharges);
    expect(result.rechargeRolls).toEqual([]);
    expect(result.changed).toBe(false);
  });

  it("refills pools that reset every turn", () => {
    const pools: ResourcePool[] = [
      { key: "legendary", label: "Legendary", max: 3, remaining: 1, resetOn: "turn" },
      { key: "ki", label: "Ki", max: 5, remaining: 1, resetOn: "shortRest" },
    ];
    const result = applyTurnStart([], pools, alwaysRecharges);

    expect(result.resources[0].remaining).toBe(3);
    expect(result.resources[1].remaining).toBe(1);
    expect(result.changed).toBe(true);
  });

  it("reports no change when a turn-reset pool is already full", () => {
    const pools: ResourcePool[] = [
      { key: "legendary", label: "Legendary", max: 3, remaining: 3, resetOn: "turn" },
    ];
    expect(applyTurnStart([], pools, alwaysRecharges).changed).toBe(false);
  });
});
