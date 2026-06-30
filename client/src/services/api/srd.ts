import { apiClient } from ".";
import type { SrdListPage, SrdMonster, SrdMonsterSummary } from "../../../../shared/dto/srd";

export const searchSrdMonsters = async (search: string) =>
  apiClient<SrdListPage<SrdMonsterSummary>>(
    `/api/srd/monsters?search=${encodeURIComponent(search)}`,
    { method: "GET" },
  );

export const getSrdMonster = async (slug: string) =>
  apiClient<SrdMonster>(`/api/srd/monsters/${encodeURIComponent(slug)}`, {
    method: "GET",
  });
