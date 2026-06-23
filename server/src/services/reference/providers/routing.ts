import {
  SRD_CATEGORY,
  SRD_SOURCE,
  type SrdCategory,
  type SrdSource,
} from "../../../../../shared/srd";

export type ProviderRouting = Record<SrdCategory, SrdSource[]>;

export const DEFAULT_ROUTING: ProviderRouting = {
  [SRD_CATEGORY.Spell]: [SRD_SOURCE.Dnd5eApi, SRD_SOURCE.Open5e],
  [SRD_CATEGORY.Monster]: [SRD_SOURCE.Open5e, SRD_SOURCE.Dnd5eApi],
  [SRD_CATEGORY.Item]: [SRD_SOURCE.Open5e, SRD_SOURCE.Dnd5eApi],
  [SRD_CATEGORY.Condition]: [SRD_SOURCE.Dnd5eApi, SRD_SOURCE.Open5e],
};
