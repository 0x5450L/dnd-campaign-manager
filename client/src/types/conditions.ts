import type { CONDITIONS } from "../constants/conditions";

export type ConditionName = (typeof CONDITIONS)[number];

export type ConditionTheme = {
  chipBorder: string;
  chipBg: string;
  chipText: string;
  fillRgba: string;
  dotRgba: string;
};
