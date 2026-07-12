import type { AbilityActivation } from "../types/encounter";

export const ABILITY_ACTIVATION_ORDER: AbilityActivation[] = [
  "passive",
  "action",
  "bonus",
  "reaction",
  "free",
  "legendary",
];

export const ABILITY_ACTIVATION_LABELS: Record<AbilityActivation, string> = {
  passive: "Traits",
  action: "Actions",
  bonus: "Bonus Actions",
  reaction: "Reactions",
  free: "Free Actions",
  legendary: "Legendary Actions",
};

export const ABILITY_ACTIVATION_NAMES: Record<AbilityActivation, string> = {
  passive: "Passive",
  action: "Action",
  bonus: "Bonus action",
  reaction: "Reaction",
  free: "Free",
  legendary: "Legendary",
};
