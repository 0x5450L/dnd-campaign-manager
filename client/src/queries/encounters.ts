import { useQuery } from "@tanstack/react-query";
import { listEncounters } from "../services/api/encounters";
import { useAuth } from "../hooks/useAuth";

export const encounterKeys = {
  all: ["encounters"] as const,
  lists: () => [...encounterKeys.all, "list"] as const,
  list: (campaignSessionId: string) => [...encounterKeys.lists(), campaignSessionId] as const,
  details: () => [...encounterKeys.all, "detail"] as const,
  detail: (id: string) => [...encounterKeys.details(), id] as const,
};

export const useActiveEncounterQuery = (campaignSessionId: string | undefined) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: encounterKeys.list(campaignSessionId ?? ""),
    queryFn: async () => (await listEncounters(campaignSessionId as string)).encounters,
    enabled: !!token && !!campaignSessionId,
    select: (encounters) => encounters.find((e) => e.status === "active") ?? null,
  });
};
