import { apiClient } from ".";
import type { GenerateLootPayload, GenerateLootResponse } from "@shared/dto/ai";

export const generateLoot = async (payload: GenerateLootPayload) =>
  apiClient<GenerateLootResponse>("/api/ai/loot", {
    method: "POST",
    body: JSON.stringify(payload),
  });
