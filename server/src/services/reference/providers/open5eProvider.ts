import { SRD_CATEGORY, SRD_SOURCE } from "@shared/constants/srd";
import type { SrdCategory, SrdCondition, SrdConditionSummary, SrdListPage, SrdCreature, SrdCreatureSummary, SrdQuery, SrdSource, SrdSpell } from "@shared/dto/srd";
import { AbstractContentProvider } from "./abstractContentProvider";
import {
  mapOpen5eCondition,
  mapOpen5eConditionSummary,
  mapOpen5eCreature,
  mapOpen5eCreatureSummary,
  mapOpen5eSpell,
  type Open5eConditionResult,
  type Open5eListResponse,
  type Open5eMonsterResult,
  type Open5eSpellResult,
} from "./mappers/open5e";

const OFFICIAL_SRD_DOCUMENT = "wotc-srd";

export class Open5eProvider extends AbstractContentProvider {
  readonly id: SrdSource = SRD_SOURCE.Open5e;
  readonly capabilities: ReadonlySet<SrdCategory> = new Set<SrdCategory>([
    SRD_CATEGORY.Condition,
    SRD_CATEGORY.Monster,
    SRD_CATEGORY.Spell,
  ]);
  protected readonly baseUrl = "https://api.open5e.com/v1";

  override async getSpell(slug: string): Promise<SrdSpell | null> {
    const response = await this.getOrNull<Open5eSpellResult>(`/spells/${slug}/`);
    if (!response) {
      return null;
    }
    return mapOpen5eSpell(response, this.id);
  }

  override async searchSpells(
    query: SrdQuery,
  ): Promise<SrdListPage<SrdSpell>> {
    const path = `/spells/${this.encodeQuery({
      search: query.search,
      limit: query.limit,
      offset: query.offset,
      page: query.filters?.page,
      document__slug: OFFICIAL_SRD_DOCUMENT,
    })}`;
    const response =
      await this.getJson<Open5eListResponse<Open5eSpellResult>>(path);
    return {
      results: response.results.map((item) => mapOpen5eSpell(item, this.id)),
      total: response.count,
      next: response.next,
    };
  }

  override async getCondition(slug: string): Promise<SrdCondition | null> {
    const response = await this.getOrNull<Open5eConditionResult>(
      `/conditions/${slug}/`,
    );
    if (!response) {
      return null;
    }
    return mapOpen5eCondition(response, this.id);
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
      results: response.results.map((item) =>
        mapOpen5eConditionSummary(item, this.id),
      ),
      total: response.count,
      next: response.next,
    };
  }

  override async getCreature(slug: string): Promise<SrdCreature | null> {
    const response = await this.getOrNull<Open5eMonsterResult>(
      `/monsters/${slug}/`,
    );
    if (!response) {
      return null;
    }
    return mapOpen5eCreature(response, this.id);
  }

  override async searchCreatures(
    query: SrdQuery,
  ): Promise<SrdListPage<SrdCreatureSummary>> {
    const path = `/monsters/${this.encodeQuery({
      search: query.search,
      limit: query.limit,
      offset: query.offset,
      document__slug: OFFICIAL_SRD_DOCUMENT,
    })}`;
    const response =
      await this.getJson<Open5eListResponse<Open5eMonsterResult>>(path);
    return {
      results: response.results.map((item) =>
        mapOpen5eCreatureSummary(item, this.id),
      ),
      total: response.count,
      next: response.next,
    };
  }
}
