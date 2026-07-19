import type { Ability, AbilityUsageAction, ResourcePool } from "../types/abilities";
import type { SpellSlotLevel } from "../types/dnd";
import { applySpellSlotUsage, listCastableSlotLevels } from "./spellSlotUsage";

export type AbilityUsageResult = {
  abilities: Ability[];
  resources: ResourcePool[];
  spellSlots: SpellSlotLevel[];
};

const replaceAbility = (abilities: Ability[], next: Ability): Ability[] =>
  abilities.map((ability) => (ability.id === next.id ? next : ability));

const replacePool = (resources: ResourcePool[], next: ResourcePool): ResourcePool[] =>
  resources.map((pool) => (pool.key === next.key ? next : pool));

export const applyAbilityUsage = (
  abilities: Ability[],
  resources: ResourcePool[],
  spellSlots: SpellSlotLevel[],
  abilityId: string,
  action: AbilityUsageAction,
  slotLevel?: number,
): AbilityUsageResult | null => {
  const ability = abilities.find((entry) => entry.id === abilityId);
  if (!ability?.cost) return null;

  const cost = ability.cost;
  switch (cost.type) {
    case "recharge": {
      const spending = action === "spend";
      if (cost.charged !== spending) return null;
      return {
        abilities: replaceAbility(abilities, {
          ...ability,
          cost: { ...cost, charged: !spending },
        }),
        resources,
        spellSlots,
      };
    }
    case "perDay": {
      const remaining = action === "spend" ? cost.remaining - 1 : cost.remaining + 1;
      if (remaining < 0 || remaining > cost.max) return null;
      return {
        abilities: replaceAbility(abilities, { ...ability, cost: { ...cost, remaining } }),
        resources,
        spellSlots,
      };
    }
    case "pool": {
      const pool = resources.find((entry) => entry.key === cost.pool);
      if (!pool) return null;
      const remaining =
        action === "spend" ? pool.remaining - cost.amount : pool.remaining + cost.amount;
      if (remaining < 0 || remaining > pool.max) return null;
      return {
        abilities,
        resources: replacePool(resources, { ...pool, remaining }),
        spellSlots,
      };
    }
    case "spellSlot": {
      const targetLevel =
        slotLevel ?? listCastableSlotLevels(spellSlots, cost.level, action)[0];
      if (targetLevel === undefined || targetLevel < cost.level) return null;
      const nextSlots = applySpellSlotUsage(spellSlots, targetLevel, action);
      if (!nextSlots) return null;
      return { abilities, resources, spellSlots: nextSlots };
    }
  }
};

export const canApplyAbilityUsage = (
  abilities: Ability[],
  resources: ResourcePool[],
  spellSlots: SpellSlotLevel[],
  abilityId: string,
  action: AbilityUsageAction,
  slotLevel?: number,
): boolean =>
  applyAbilityUsage(abilities, resources, spellSlots, abilityId, action, slotLevel) !== null;

export type RechargeRollResult = {
  abilityId: string;
  abilityName: string;
  roll: number;
  threshold: number;
  charged: boolean;
};

export type TurnStartResult = {
  abilities: Ability[];
  resources: ResourcePool[];
  rechargeRolls: RechargeRollResult[];
  changed: boolean;
};

export const applyTurnStart = (
  abilities: Ability[],
  resources: ResourcePool[],
  rollD6: () => number,
): TurnStartResult => {
  let changed = false;

  const nextResources = resources.map((pool) => {
    if (pool.resetOn !== "turn" || pool.remaining === pool.max) return pool;
    changed = true;
    return { ...pool, remaining: pool.max };
  });

  const rechargeRolls: RechargeRollResult[] = [];
  const nextAbilities = abilities.map((ability) => {
    if (ability.cost?.type !== "recharge" || ability.cost.charged) return ability;
    const roll = rollD6();
    const charged = roll >= ability.cost.threshold;
    rechargeRolls.push({
      abilityId: ability.id,
      abilityName: ability.name,
      roll,
      threshold: ability.cost.threshold,
      charged,
    });
    if (!charged) return ability;
    changed = true;
    return { ...ability, cost: { ...ability.cost, charged: true } };
  });

  return { abilities: nextAbilities, resources: nextResources, rechargeRolls, changed };
};
