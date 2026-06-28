import { useQuery } from "@tanstack/react-query";
import { searchSrdMonsters } from "../services/api/srd";
import { useAuthStore } from "../state/auth/authStore";

export const srdKeys = {
  all: ["srd"] as const,
  monsters: () => [...srdKeys.all, "monsters"] as const,
  monsterSearch: (search: string) =>
    [...srdKeys.monsters(), "search", search] as const,
};

export const useSrdMonsterSearchQuery = (search: string) => {
  const token = useAuthStore((s) => s.token);
  const trimmed = search.trim();
  return useQuery({
    queryKey: srdKeys.monsterSearch(trimmed),
    queryFn: () => searchSrdMonsters(trimmed),
    enabled: !!token && trimmed.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};
