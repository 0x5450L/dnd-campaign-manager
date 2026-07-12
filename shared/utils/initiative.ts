import { calcModifier } from "./dndMath";
import { rollDie } from "./dice";

export type InitiativeRollResult = {
  roll: number;
  modifier: number;
  total: number;
};

export const rollInitiative = (
  scores: { name: string; score: number }[] | null,
  rollD20: () => number = () => rollDie(20),
): InitiativeRollResult => {
  const dex = scores?.find((entry) => entry.name === "dex")?.score;
  const modifier = typeof dex === "number" ? calcModifier(dex) : 0;
  const roll = rollD20();
  return { roll, modifier, total: roll + modifier };
};
