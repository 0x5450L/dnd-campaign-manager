import { CONDITIONS } from "../constants/conditions";
import type { ConditionName } from "../types/conditions";

export const isKnownCondition = (value: string): value is ConditionName =>
  (CONDITIONS as readonly string[]).includes(value);
