import { SRD_CATEGORY } from "../../../../shared/constants/srd";
import type { SrdCategory, SrdCondition, SrdConditionSummary, SrdItem, SrdItemSummary, SrdListPage, SrdCreature, SrdCreatureSummary, SrdQuery, SrdSpell, SrdSpellSummary } from "../../../../shared/dto/srd";
import type { CacheStore } from "./cache/cacheStore";
import type { ProviderRouter } from "./providers/providerRouter";
import { referenceKeys } from "./referenceKeys";
import type { ReferenceStore } from "./referenceStore";

const DEFAULT_TTL_SECONDS = 86_400;

export class ReferenceService {
  constructor(
    private readonly router: ProviderRouter,
    private readonly cache: CacheStore,
    private readonly store: ReferenceStore,
    private readonly ttlSeconds: number = DEFAULT_TTL_SECONDS,
  ) {}

  getSpell(slug: string): Promise<SrdSpell | null> {
    return this.resolveDetail(SRD_CATEGORY.Spell, slug, () =>
      this.router.getSpell(slug),
    );
  }

  searchSpells(query: SrdQuery): Promise<SrdListPage<SrdSpellSummary>> {
    return this.resolveSearch(SRD_CATEGORY.Spell, query, () =>
      this.router.searchSpells(query),
    );
  }

  getCreature(slug: string): Promise<SrdCreature | null> {
    return this.resolveDetail(SRD_CATEGORY.Monster, slug, () =>
      this.router.getCreature(slug),
    );
  }

  searchCreatures(query: SrdQuery): Promise<SrdListPage<SrdCreatureSummary>> {
    return this.resolveSearch(SRD_CATEGORY.Monster, query, () =>
      this.router.searchCreatures(query),
    );
  }

  getItem(slug: string): Promise<SrdItem | null> {
    return this.resolveDetail(SRD_CATEGORY.Item, slug, () =>
      this.router.getItem(slug),
    );
  }

  searchItems(query: SrdQuery): Promise<SrdListPage<SrdItemSummary>> {
    return this.resolveSearch(SRD_CATEGORY.Item, query, () =>
      this.router.searchItems(query),
    );
  }

  getCondition(slug: string): Promise<SrdCondition | null> {
    return this.resolveDetail(SRD_CATEGORY.Condition, slug, () =>
      this.router.getCondition(slug),
    );
  }

  searchConditions(query: SrdQuery): Promise<SrdListPage<SrdConditionSummary>> {
    return this.resolveSearch(SRD_CATEGORY.Condition, query, () =>
      this.router.searchConditions(query),
    );
  }

  private async resolveDetail<TDetail>(
    category: SrdCategory,
    slug: string,
    fetchFromProvider: () => Promise<TDetail | null>,
  ): Promise<TDetail | null> {
    const stored = await this.store.readDetail<TDetail>(category, slug);
    if (stored) {
      return stored;
    }
    const key = referenceKeys.detail(category, slug);
    const cached = await this.cache.get(key);
    if (cached) {
      return JSON.parse(cached) as TDetail;
    }
    const fetched = await fetchFromProvider();
    if (fetched) {
      await this.cache.set(key, JSON.stringify(fetched), this.ttlSeconds);
    }
    return fetched;
  }

  private async resolveSearch<TSummary>(
    category: SrdCategory,
    query: SrdQuery,
    fetchFromProvider: () => Promise<SrdListPage<TSummary>>,
  ): Promise<SrdListPage<TSummary>> {
    const key = referenceKeys.search(category, query);
    const cached = await this.cache.get(key);
    if (cached) {
      return JSON.parse(cached) as SrdListPage<TSummary>;
    }
    const fetched = await fetchFromProvider();
    await this.cache.set(key, JSON.stringify(fetched), this.ttlSeconds);
    return fetched;
  }
}
