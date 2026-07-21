import { apiClient } from ".";
import type { SrdListPage, SrdCreature, SrdCreatureSummary, SrdSpell } from "@shared/dto/srd";

export const searchSrdCreatures = async (search: string) =>
  apiClient<SrdListPage<SrdCreatureSummary>>(
    `/api/srd/monsters?search=${encodeURIComponent(search)}`,
    { method: "GET" },
  );

export const getSrdCreature = async (slug: string) =>
  apiClient<SrdCreature>(`/api/srd/monsters/${encodeURIComponent(slug)}`, {
    method: "GET",
  });

export const listSrdSpells = async () =>
  apiClient<SrdListPage<SrdSpell>>(`/api/srd/spells`, { method: "GET" });

export const getSrdSpell = async (slug: string) =>
  apiClient<SrdSpell>(`/api/srd/spells/${encodeURIComponent(slug)}`, {
    method: "GET",
  });
