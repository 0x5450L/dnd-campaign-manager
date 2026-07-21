import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSrdCreature,
  listSrdSpells,
  searchSrdCreatures,
} from "../services/api/srd";
import { buildSpellIndex } from "../utils/srd/spellIndex";
import { useAuthStore } from "../state/auth/authStore";

export const srdKeys = {
  all: ["srd"] as const,
  creatures: () => [...srdKeys.all, "creatures"] as const,
  creatureSearch: (search: string) =>
    [...srdKeys.creatures(), "search", search] as const,
  creature: (slug: string) => [...srdKeys.creatures(), "detail", slug] as const,
  spells: () => [...srdKeys.all, "spells"] as const,
  spellPool: () => [...srdKeys.spells(), "pool"] as const,
};

const SPELL_POOL_STALE_MS = 60 * 60 * 1000;

export const useSrdSpellIndexQuery = (enabled = true) => {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: srdKeys.spellPool(),
    queryFn: () => listSrdSpells(),
    enabled: enabled && !!token,
    staleTime: SPELL_POOL_STALE_MS,
    select: (page) => buildSpellIndex(page.results),
  });
};

export const useSrdCreatureSearchQuery = (search: string) => {
  const token = useAuthStore((s) => s.token);
  const trimmed = search.trim();
  return useQuery({
    queryKey: srdKeys.creatureSearch(trimmed),
    queryFn: () => searchSrdCreatures(trimmed),
    enabled: !!token && trimmed.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSrdCreatureFetcher = () => {
  const queryClient = useQueryClient();
  return (slug: string) =>
    queryClient.fetchQuery({
      queryKey: srdKeys.creature(slug),
      queryFn: () => getSrdCreature(slug),
      staleTime: 5 * 60 * 1000,
    });
};
