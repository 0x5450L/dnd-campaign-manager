import type { SrdCategory, SrdQuery } from "@shared/dto/srd";

function serializeQuery(query: SrdQuery): string {
  const filters = query.filters
    ? Object.entries(query.filters)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join(",")
    : "";
  return [query.search ?? "", query.limit ?? "", query.offset ?? "", filters].join(
    "|",
  );
}

export const referenceKeys = {
  detail: (category: SrdCategory, slug: string): string =>
    `srd:${category}:detail:${slug}`,
  search: (category: SrdCategory, query: SrdQuery): string =>
    `srd:${category}:search:${serializeQuery(query)}`,
  spellPool: (): string => "srd:spell:pool",
};
