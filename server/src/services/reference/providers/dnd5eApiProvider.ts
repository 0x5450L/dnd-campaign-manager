import { SRD_CATEGORY, SRD_SOURCE } from "@shared/constants/srd";
import type { SrdCategory, SrdCondition, SrdConditionSummary, SrdListPage, SrdQuery, SrdSource } from "@shared/dto/srd";
import { AbstractContentProvider } from "./abstractContentProvider";
import {
  mapDnd5eCondition,
  mapDnd5eConditionSummary,
  type Dnd5eConditionResponse,
  type Dnd5eListResponse,
} from "./mappers/dnd5eApi";

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
    return mapDnd5eCondition(response, this.id);
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
      results: matched.map((item) => mapDnd5eConditionSummary(item, this.id)),
      total: matched.length,
      next: null,
    };
  }
}
