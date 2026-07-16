import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSrdCreature, searchSrdCreatures } from "../services/api/srd";
import { useAuthStore } from "../state/auth/authStore";

export const srdKeys = {
  all: ["srd"] as const,
  creatures: () => [...srdKeys.all, "creatures"] as const,
  creatureSearch: (search: string) =>
    [...srdKeys.creatures(), "search", search] as const,
  creature: (slug: string) => [...srdKeys.creatures(), "detail", slug] as const,
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
