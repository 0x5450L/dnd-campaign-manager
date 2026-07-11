import type { SrdCreature, SrdCreatureAction } from "../../../../shared/dto/srd";
import type {
  Ability,
  AbilityActivation,
  AbilityCost,
  ResourcePool,
} from "../../../../shared/types/abilities";
import { parseCreatureAction } from "./creatureActionParser";

const TO_HIT_BONUS = /^[+-]\d+$/;
const RECHARGE = /Recharge\s+(\d)/i;
const PER_DAY = /(\d+)\s*\/\s*Day/i;
const LEGENDARY_RESISTANCE = /Legendary Resistance/i;

const LEGENDARY_POOL = "legendary";
const LEGENDARY_RESISTANCE_POOL = "legendaryResistance";
const DEFAULT_LEGENDARY_ACTIONS = 3;

const detectCost = (text: string): AbilityCost | null => {
  const recharge = text.match(RECHARGE);
  if (recharge) {
    return { type: "recharge", threshold: Number(recharge[1]), charged: true };
  }
  const perDay = text.match(PER_DAY);
  if (perDay) {
    const max = Number(perDay[1]);
    return { type: "perDay", max, remaining: max };
  }
  return null;
};

const toAbility = (
  action: SrdCreatureAction,
  activation: AbilityActivation,
  cost: AbilityCost | null,
): Ability => ({
  id: crypto.randomUUID(),
  name: action.name,
  description: action.description,
  activation,
  cost,
});

export const creatureAbilities = (creature: SrdCreature): Ability[] => {
  const abilities: Ability[] = [];

  for (const ability of creature.specialAbilities) {
    const isLegendaryResistance = LEGENDARY_RESISTANCE.test(ability.name);
    const cost: AbilityCost | null = isLegendaryResistance
      ? { type: "pool", pool: LEGENDARY_RESISTANCE_POOL, amount: 1 }
      : detectCost(`${ability.name} ${ability.description}`);
    abilities.push(toAbility(ability, "passive", cost));
  }

  for (const action of creature.actions) {
    const parsed = parseCreatureAction(action.description);
    if (TO_HIT_BONUS.test(parsed.attackBonus)) continue;
    abilities.push(toAbility(action, "action", detectCost(`${action.name} ${action.description}`)));
  }

  for (const legendary of creature.legendaryActions) {
    abilities.push(
      toAbility(legendary, "legendary", { type: "pool", pool: LEGENDARY_POOL, amount: 1 }),
    );
  }

  return abilities;
};

const legendaryResistanceCharges = (creature: SrdCreature): number | null => {
  const entry = creature.specialAbilities.find((ability) =>
    LEGENDARY_RESISTANCE.test(ability.name),
  );
  if (!entry) return null;
  const perDay = `${entry.name} ${entry.description}`.match(PER_DAY);
  return perDay ? Number(perDay[1]) : DEFAULT_LEGENDARY_ACTIONS;
};

export const creatureResourcePools = (creature: SrdCreature): ResourcePool[] => {
  const resources: ResourcePool[] = [];

  if (creature.legendaryActions.length > 0) {
    resources.push({
      key: LEGENDARY_POOL,
      label: "Legendary Actions",
      max: DEFAULT_LEGENDARY_ACTIONS,
      remaining: DEFAULT_LEGENDARY_ACTIONS,
      resetOn: "turn",
    });
  }

  const resistance = legendaryResistanceCharges(creature);
  if (resistance !== null) {
    resources.push({
      key: LEGENDARY_RESISTANCE_POOL,
      label: "Legendary Resistance",
      max: resistance,
      remaining: resistance,
      resetOn: "longRest",
    });
  }

  return resources;
};
