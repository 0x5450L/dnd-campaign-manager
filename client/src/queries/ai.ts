import { useMutation } from "@tanstack/react-query";
import type {
  GenerateEncounterPayload,
  GenerateLootPayload,
} from "@shared/dto/ai";
import { generateEncounter, generateLoot } from "../services/api/ai";

export const aiKeys = {
  all: ["ai"] as const,
  generations: () => [...aiKeys.all, "generation"] as const,
  loot: (campaignId: string) =>
    [...aiKeys.generations(), "loot", campaignId] as const,
  encounter: (campaignId: string) =>
    [...aiKeys.generations(), "encounter", campaignId] as const,
};

export const useGenerateLootMutation = () =>
  useMutation({
    mutationFn: async (payload: GenerateLootPayload) =>
      (await generateLoot(payload)).generation,
  });

export const useGenerateEncounterMutation = () =>
  useMutation({
    mutationFn: async (payload: GenerateEncounterPayload) =>
      (await generateEncounter(payload)).generation,
  });
