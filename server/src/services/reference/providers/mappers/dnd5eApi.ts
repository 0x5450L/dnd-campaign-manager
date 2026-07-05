import type {
  SrdCondition,
  SrdConditionSummary,
  SrdSource,
} from "../../../../../../shared/dto/srd";

export type Dnd5eListItem = {
  index: string;
  name: string;
};

export type Dnd5eListResponse = {
  count: number;
  results: Dnd5eListItem[];
};

export type Dnd5eConditionResponse = {
  index: string;
  name: string;
  desc: string[];
};

export const mapDnd5eCondition = (
  raw: Dnd5eConditionResponse,
  source: SrdSource,
): SrdCondition => ({
  slug: raw.index,
  name: raw.name,
  source,
  description: raw.desc.join("\n\n"),
});

export const mapDnd5eConditionSummary = (
  raw: Dnd5eListItem,
  source: SrdSource,
): SrdConditionSummary => ({
  slug: raw.index,
  name: raw.name,
  source,
});
