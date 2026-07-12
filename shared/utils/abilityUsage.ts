import type { Ability, AbilityUsageAction, ResourcePool } from "../types/abilities";

export type AbilityUsageResult = {
  abilities: Ability[];
  resources: ResourcePool[];
};

const replaceAbility = (abilities: Ability[], next: Ability): Ability[] =>
  abilities.map((ability) => (ability.id === next.id ? next : ability));

const replacePool = (resources: ResourcePool[], next: ResourcePool): ResourcePool[] =>
  resources.map((pool) => (pool.key === next.key ? next : pool));

export const applyAbilityUsage = (
  abilities: Ability[],
  resources: ResourcePool[],
  abilityId: string,
  action: AbilityUsageAction,
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
      };
    }
    case "perDay": {
      const remaining = action === "spend" ? cost.remaining - 1 : cost.remaining + 1;
      if (remaining < 0 || remaining > cost.max) return null;
      return {
        abilities: replaceAbility(abilities, { ...ability, cost: { ...cost, remaining } }),
        resources,
      };
    }
    case "pool": {
      const pool = resources.find((entry) => entry.key === cost.pool);
      if (!pool) return null;
      const remaining =
        action === "spend" ? pool.remaining - cost.amount : pool.remaining + cost.amount;
      if (remaining < 0 || remaining > pool.max) return null;
      return { abilities, resources: replacePool(resources, { ...pool, remaining }) };
    }
    case "spellSlot":
      return null;
  }
};

export const canApplyAbilityUsage = (
  abilities: Ability[],
  resources: ResourcePool[],
  abilityId: string,
  action: AbilityUsageAction,
): boolean => applyAbilityUsage(abilities, resources, abilityId, action) !== null;
