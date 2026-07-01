import { apiClient } from ".";
import type { SrdListPage, SrdCreature, SrdCreatureSummary } from "../../../../shared/dto/srd";

export const searchSrdCreatures = async (search: string) =>
  apiClient<SrdListPage<SrdCreatureSummary>>(
    `/api/srd/monsters?search=${encodeURIComponent(search)}`,
    { method: "GET" },
  );

export const getSrdCreature = async (slug: string) =>
  apiClient<SrdCreature>(`/api/srd/monsters/${encodeURIComponent(slug)}`, {
    method: "GET",
  });
