import { apiClient } from ".";
import type {
  GenerateEncounterPayload,
  GenerateEncounterResponse,
  GenerateLootPayload,
  GenerateLootResponse,
} from "@dnd/shared/dto/ai";

export const generateLoot = async (payload: GenerateLootPayload) =>
  apiClient<GenerateLootResponse>("/api/ai/loot", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const generateEncounter = async (payload: GenerateEncounterPayload) =>
  apiClient<GenerateEncounterResponse>("/api/ai/encounter", {
    method: "POST",
    body: JSON.stringify(payload),
  });
