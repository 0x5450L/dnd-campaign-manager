import type { ResourceReset } from "../types/encounter";

export const RESOURCE_RESET_ORDER: ResourceReset[] = [
  "turn",
  "round",
  "shortRest",
  "longRest",
  "never",
];

export const RESOURCE_RESET_LABELS: Record<ResourceReset, string> = {
  turn: "Start of turn",
  round: "Each round",
  shortRest: "Short rest",
  longRest: "Long rest",
  never: "Never",
};
