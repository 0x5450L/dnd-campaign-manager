import type { SpellSlotLevel } from "./dnd";

export type AbilityActivation =
  | "passive"
  | "action"
  | "bonus"
  | "reaction"
  | "free"
  | "legendary";

export type AbilityCost =
  | { type: "recharge"; threshold: number; charged: boolean }
  | { type: "perDay"; max: number; remaining: number }
  | { type: "spellSlot"; level: SpellSlotLevel }
  | { type: "pool"; pool: string; amount: number };

export type Ability = {
  id: string;
  name: string;
  description: string;
  activation: AbilityActivation;
  cost: AbilityCost | null;
};

export type ResourceReset = "turn" | "round" | "shortRest" | "longRest" | "never";

export type ResourcePool = {
  key: string;
  label: string;
  max: number;
  remaining: number;
  resetOn: ResourceReset;
};
