import type { SrdCategory, SrdCondition, SrdConditionSummary, SrdItem, SrdItemSummary, SrdListPage, SrdCreature, SrdCreatureSummary, SrdQuery, SrdSource, SrdSpell, SrdSpellSummary } from "../../../../../shared/dto/srd";

export interface ContentProvider {
  readonly id: SrdSource;
  readonly capabilities: ReadonlySet<SrdCategory>;

  getSpell(slug: string): Promise<SrdSpell | null>;
  searchSpells(query: SrdQuery): Promise<SrdListPage<SrdSpellSummary>>;

  getCreature(slug: string): Promise<SrdCreature | null>;
  searchCreatures(query: SrdQuery): Promise<SrdListPage<SrdCreatureSummary>>;

  getItem(slug: string): Promise<SrdItem | null>;
  searchItems(query: SrdQuery): Promise<SrdListPage<SrdItemSummary>>;

  getCondition(slug: string): Promise<SrdCondition | null>;
  searchConditions(query: SrdQuery): Promise<SrdListPage<SrdConditionSummary>>;
}
