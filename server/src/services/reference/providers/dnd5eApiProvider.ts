import { SRD_CATEGORY, SRD_SOURCE } from "../../../../../shared/constants/srd";
import type { SrdCategory, SrdCondition, SrdConditionSummary, SrdListPage, SrdQuery, SrdSource } from "../../../../../shared/dto/srd";
import { AbstractContentProvider } from "./abstractContentProvider";
import { ProviderRequestError } from "./providerErrors";

interface Dnd5eListItem {
  index: string;
  name: string;
}

interface Dnd5eListResponse {
  count: number;
  results: Dnd5eListItem[];
}

interface Dnd5eConditionResponse {
  index: string;
  name: string;
  desc: string[];
}

export class Dnd5eApiProvider extends AbstractContentProvider {
  readonly id: SrdSource = SRD_SOURCE.Dnd5eApi;
  readonly capabilities: ReadonlySet<SrdCategory> = new Set<SrdCategory>([
    SRD_CATEGORY.Condition,
  ]);
  protected readonly baseUrl = "https://www.dnd5eapi.co/api";

  override async getCondition(slug: string): Promise<SrdCondition | null> {
    const response = await this.getOrNull<Dnd5eConditionResponse>(
      `/conditions/${slug}`,
    );
    if (!response) {
      return null;
    }
    return {
      slug: response.index,
      name: response.name,
      source: this.id,
      description: response.desc.join("\n\n"),
    };
  }

  override async searchConditions(
    query: SrdQuery,
  ): Promise<SrdListPage<SrdConditionSummary>> {
    const response = await this.getJson<Dnd5eListResponse>("/conditions");
    const term = query.search?.toLowerCase();
    const matched = term
      ? response.results.filter((item) => item.name.toLowerCase().includes(term))
      : response.results;
    return {
      results: matched.map((item) => ({
        slug: item.index,
        name: item.name,
        source: this.id,
      })),
      total: matched.length,
      next: null,
    };
  }

  private async getOrNull<TResponse>(path: string): Promise<TResponse | null> {
    try {
      return await this.getJson<TResponse>(path);
    } catch (error) {
      if (error instanceof ProviderRequestError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }
}
