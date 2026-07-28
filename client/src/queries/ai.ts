import { useMutation } from "@tanstack/react-query";
import type { GenerateLootPayload } from "@shared/dto/ai";
import { generateLoot } from "../services/api/ai";

export const aiKeys = {
  all: ["ai"] as const,
  generations: () => [...aiKeys.all, "generation"] as const,
  loot: (campaignId: string) =>
    [...aiKeys.generations(), "loot", campaignId] as const,
};

export const useGenerateLootMutation = () =>
  useMutation({
    mutationFn: async (payload: GenerateLootPayload) =>
      (await generateLoot(payload)).generation,
  });
