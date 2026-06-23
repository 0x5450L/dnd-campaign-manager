import {
  SRD_CATEGORY,
  type SrdCategory,
  type SrdCondition,
  type SrdConditionSummary,
  type SrdItem,
  type SrdItemSummary,
  type SrdListPage,
  type SrdMonster,
  type SrdMonsterSummary,
  type SrdQuery,
  type SrdSource,
  type SrdSpell,
  type SrdSpellSummary,
} from "../../../../../shared/srd";
import type { ContentProvider } from "./contentProvider";
import { ProviderRequestError, ProviderUnsupportedError } from "./providerErrors";

const DEFAULT_TIMEOUT_MS = 8000;

export abstract class AbstractContentProvider implements ContentProvider {
  abstract readonly id: SrdSource;
  abstract readonly capabilities: ReadonlySet<SrdCategory>;
  protected abstract readonly baseUrl: string;
  protected readonly timeoutMs: number = DEFAULT_TIMEOUT_MS;

  async getSpell(_slug: string): Promise<SrdSpell | null> {
    return this.unsupported(SRD_CATEGORY.Spell);
  }

  async searchSpells(_query: SrdQuery): Promise<SrdListPage<SrdSpellSummary>> {
    return this.unsupported(SRD_CATEGORY.Spell);
  }

  async getMonster(_slug: string): Promise<SrdMonster | null> {
    return this.unsupported(SRD_CATEGORY.Monster);
  }

  async searchMonsters(_query: SrdQuery): Promise<SrdListPage<SrdMonsterSummary>> {
    return this.unsupported(SRD_CATEGORY.Monster);
  }

  async getItem(_slug: string): Promise<SrdItem | null> {
    return this.unsupported(SRD_CATEGORY.Item);
  }

  async searchItems(_query: SrdQuery): Promise<SrdListPage<SrdItemSummary>> {
    return this.unsupported(SRD_CATEGORY.Item);
  }

  async getCondition(_slug: string): Promise<SrdCondition | null> {
    return this.unsupported(SRD_CATEGORY.Condition);
  }

  async searchConditions(
    _query: SrdQuery,
  ): Promise<SrdListPage<SrdConditionSummary>> {
    return this.unsupported(SRD_CATEGORY.Condition);
  }

  protected unsupported(category: SrdCategory): never {
    throw new ProviderUnsupportedError(this.id, category);
  }

  protected async getJson<TResponse>(path: string): Promise<TResponse> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new ProviderRequestError(
          this.id,
          response.status,
          `${this.id} responded ${response.status} for ${path}`,
        );
      }
      return (await response.json()) as TResponse;
    } catch (error) {
      if (error instanceof ProviderRequestError) {
        throw error;
      }
      const reason = error instanceof Error ? error.message : "unknown error";
      throw new ProviderRequestError(this.id, null, `${this.id} request failed: ${reason}`);
    } finally {
      clearTimeout(timer);
    }
  }

  protected encodeQuery(params: Record<string, string | number | undefined>): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        search.set(key, String(value));
      }
    }
    const serialized = search.toString();
    return serialized ? `?${serialized}` : "";
  }
}
