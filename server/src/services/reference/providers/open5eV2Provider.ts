import { SRD_CATEGORY, SRD_SOURCE } from "@shared/constants/srd";
import type {
  SrdCategory,
  SrdItem,
  SrdItemSummary,
  SrdListPage,
  SrdQuery,
  SrdSource,
} from "@shared/dto/srd";
import { AbstractContentProvider } from "./abstractContentProvider";
import {
  mapOpen5eV2Item,
  mapOpen5eV2ItemSummary,
  type Open5eV2ItemResult,
  type Open5eV2ListResponse,
} from "./mappers/open5eV2";

const SRD_DOCUMENT_PREFIX = "srd";

const isSrdDocument = (item: Open5eV2ItemResult): boolean =>
  item.document?.key?.startsWith(SRD_DOCUMENT_PREFIX) ?? false;

export class Open5eV2Provider extends AbstractContentProvider {
  readonly id: SrdSource = SRD_SOURCE.Open5eV2;
  readonly capabilities: ReadonlySet<SrdCategory> = new Set<SrdCategory>([
    SRD_CATEGORY.Item,
  ]);
  protected readonly baseUrl = "https://api.open5e.com/v2";

  override async getItem(slug: string): Promise<SrdItem | null> {
    const response = await this.getOrNull<Open5eV2ItemResult>(`/items/${slug}/`);
    if (!response) {
      return null;
    }
    return mapOpen5eV2Item(response, this.id);
  }

  override async searchItems(
    query: SrdQuery,
  ): Promise<SrdListPage<SrdItemSummary>> {
    const path = `/items/${this.encodeQuery({
      search: query.search,
      limit: query.limit,
      offset: query.offset,
      page: query.filters?.page,
    })}`;
    const response =
      await this.getJson<Open5eV2ListResponse<Open5eV2ItemResult>>(path);
    return {
      results: response.results
        .filter(isSrdDocument)
        .map((item) => mapOpen5eV2ItemSummary(item, this.id)),
      total: response.count,
      next: response.next,
    };
  }
}
