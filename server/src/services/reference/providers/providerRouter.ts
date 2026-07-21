import { SRD_CATEGORY } from "@shared/constants/srd";
import type { SrdCategory, SrdCondition, SrdConditionSummary, SrdItem, SrdItemSummary, SrdListPage, SrdCreature, SrdCreatureSummary, SrdQuery, SrdSource, SrdSpell } from "@shared/dto/srd";
import type { ContentProvider } from "./contentProvider";
import { NoProviderAvailableError } from "./providerErrors";
import { DEFAULT_ROUTING, type ProviderRouting } from "./routing";

export class ProviderRouter {
  private readonly byId: Map<SrdSource, ContentProvider>;

  constructor(
    providers: ContentProvider[],
    private readonly routing: ProviderRouting = DEFAULT_ROUTING,
  ) {
    this.byId = new Map(providers.map((provider) => [provider.id, provider]));
  }

  getSpell(slug: string): Promise<SrdSpell | null> {
    return this.run(SRD_CATEGORY.Spell, (provider) => provider.getSpell(slug));
  }

  searchSpells(query: SrdQuery): Promise<SrdListPage<SrdSpell>> {
    return this.run(SRD_CATEGORY.Spell, (provider) => provider.searchSpells(query));
  }

  getCreature(slug: string): Promise<SrdCreature | null> {
    return this.run(SRD_CATEGORY.Monster, (provider) => provider.getCreature(slug));
  }

  searchCreatures(query: SrdQuery): Promise<SrdListPage<SrdCreatureSummary>> {
    return this.run(SRD_CATEGORY.Monster, (provider) =>
      provider.searchCreatures(query),
    );
  }

  getItem(slug: string): Promise<SrdItem | null> {
    return this.run(SRD_CATEGORY.Item, (provider) => provider.getItem(slug));
  }

  searchItems(query: SrdQuery): Promise<SrdListPage<SrdItemSummary>> {
    return this.run(SRD_CATEGORY.Item, (provider) => provider.searchItems(query));
  }

  getCondition(slug: string): Promise<SrdCondition | null> {
    return this.run(SRD_CATEGORY.Condition, (provider) =>
      provider.getCondition(slug),
    );
  }

  searchConditions(query: SrdQuery): Promise<SrdListPage<SrdConditionSummary>> {
    return this.run(SRD_CATEGORY.Condition, (provider) =>
      provider.searchConditions(query),
    );
  }

  private resolve(category: SrdCategory): ContentProvider[] {
    return this.routing[category]
      .map((source) => this.byId.get(source))
      .filter(
        (provider): provider is ContentProvider =>
          provider !== undefined && provider.capabilities.has(category),
      );
  }

  private async run<TResult>(
    category: SrdCategory,
    operation: (provider: ContentProvider) => Promise<TResult>,
  ): Promise<TResult> {
    const providers = this.resolve(category);
    const causes: unknown[] = [];
    for (const provider of providers) {
      try {
        return await operation(provider);
      } catch (error) {
        causes.push(error);
      }
    }
    throw new NoProviderAvailableError(category, causes);
  }
}
