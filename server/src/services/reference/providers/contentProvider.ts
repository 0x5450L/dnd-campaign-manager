import type {
  SrdCategory,
  SrdCondition,
  SrdConditionSummary,
  SrdItem,
  SrdItemSummary,
  SrdListPage,
  SrdMonster,
  SrdMonsterSummary,
  SrdQuery,
  SrdSource,
  SrdSpell,
  SrdSpellSummary,
} from "../../../../../shared/srd";

export interface ContentProvider {
  readonly id: SrdSource;
  readonly capabilities: ReadonlySet<SrdCategory>;

  getSpell(slug: string): Promise<SrdSpell | null>;
  searchSpells(query: SrdQuery): Promise<SrdListPage<SrdSpellSummary>>;

  getMonster(slug: string): Promise<SrdMonster | null>;
  searchMonsters(query: SrdQuery): Promise<SrdListPage<SrdMonsterSummary>>;

  getItem(slug: string): Promise<SrdItem | null>;
  searchItems(query: SrdQuery): Promise<SrdListPage<SrdItemSummary>>;

  getCondition(slug: string): Promise<SrdCondition | null>;
  searchConditions(query: SrdQuery): Promise<SrdListPage<SrdConditionSummary>>;
}
