import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSrdCreature,
  getSrdItem,
  listSrdSpells,
  searchSrdCreatures,
} from "../services/api/srd";
import { buildSpellIndex } from "../utils/srd/spellIndex";
import { useIsSignedIn } from "./auth";

export const srdKeys = {
  all: ["srd"] as const,
  creatures: () => [...srdKeys.all, "creatures"] as const,
  creatureSearch: (search: string) =>
    [...srdKeys.creatures(), "search", search] as const,
  creature: (slug: string) => [...srdKeys.creatures(), "detail", slug] as const,
  spells: () => [...srdKeys.all, "spells"] as const,
  spellPool: () => [...srdKeys.spells(), "pool"] as const,
  items: () => [...srdKeys.all, "items"] as const,
  item: (slug: string) => [...srdKeys.items(), "detail", slug] as const,
};

const ITEM_STALE_MS = 60 * 60 * 1000;

const SPELL_POOL_STALE_MS = 60 * 60 * 1000;

export const useSrdSpellIndexQuery = (enabled = true) => {
  const signedIn = useIsSignedIn();
  return useQuery({
    queryKey: srdKeys.spellPool(),
    queryFn: () => listSrdSpells(),
    enabled: enabled && signedIn,
    staleTime: SPELL_POOL_STALE_MS,
    select: (page) => buildSpellIndex(page.results),
  });
};

export const useSrdCreatureSearchQuery = (search: string) => {
  const signedIn = useIsSignedIn();
  const trimmed = search.trim();
  return useQuery({
    queryKey: srdKeys.creatureSearch(trimmed),
    queryFn: () => searchSrdCreatures(trimmed),
    enabled: signedIn && trimmed.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSrdItemQuery = (slug: string | null) => {
  const signedIn = useIsSignedIn();
  return useQuery({
    queryKey: srdKeys.item(slug ?? ""),
    queryFn: () => getSrdItem(slug as string),
    enabled: signedIn && !!slug,
    staleTime: ITEM_STALE_MS,
  });
};

export const useSrdCreatureQuery = (slug: string | null) => {
  const signedIn = useIsSignedIn();
  return useQuery({
    queryKey: srdKeys.creature(slug ?? ""),
    queryFn: () => getSrdCreature(slug as string),
    enabled: signedIn && !!slug,
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
