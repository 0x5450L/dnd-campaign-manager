import {
  SRD_CATEGORY,
  SRD_SOURCE,
  type SrdCategory,
  type SrdCondition,
  type SrdConditionSummary,
  type SrdListPage,
  type SrdQuery,
  type SrdSource,
} from "../../../../../shared/srd";
import { AbstractContentProvider } from "./abstractContentProvider";
import { ProviderRequestError } from "./providerErrors";

interface Open5eConditionResult {
  slug: string;
  name: string;
  desc: string;
}

interface Open5eListResponse<TResult> {
  count: number;
  next: string | null;
  results: TResult[];
}

export class Open5eProvider extends AbstractContentProvider {
  readonly id: SrdSource = SRD_SOURCE.Open5e;
  readonly capabilities: ReadonlySet<SrdCategory> = new Set<SrdCategory>([
    SRD_CATEGORY.Condition,
  ]);
  protected readonly baseUrl = "https://api.open5e.com/v1";

  override async getCondition(slug: string): Promise<SrdCondition | null> {
    const response = await this.getOrNull<Open5eConditionResult>(
      `/conditions/${slug}/`,
    );
    if (!response) {
      return null;
    }
    return {
      slug: response.slug,
      name: response.name,
      source: this.id,
      description: response.desc,
    };
  }

  override async searchConditions(
    query: SrdQuery,
  ): Promise<SrdListPage<SrdConditionSummary>> {
    const path = `/conditions/${this.encodeQuery({
      search: query.search,
      limit: query.limit,
      offset: query.offset,
    })}`;
    const response =
      await this.getJson<Open5eListResponse<Open5eConditionResult>>(path);
    return {
      results: response.results.map((item) => ({
        slug: item.slug,
        name: item.name,
        source: this.id,
      })),
      total: response.count,
      next: response.next,
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
