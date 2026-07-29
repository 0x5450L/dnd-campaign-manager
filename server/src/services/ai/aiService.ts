import { randomUUID } from "node:crypto";
import { AI_GENERATION_KIND } from "@shared/constants/ai";
import type { GenerateLootPayload, LootGeneration } from "@shared/dto/ai";
import { requireCampaignDM } from "../../utils/accessControl";
import { AppError } from "../../utils/errors";
import { loadCampaignLootContext } from "./aiContextRepository";
import {
  NotEnoughCandidatesError,
  type LootGenerator,
} from "./generators/lootGenerator";
import type { TextProvider } from "./providers/aiProvider";
import {
  AiInvalidOutputError,
  AiProviderNotConfiguredError,
  AiProviderRateLimitedError,
  AiProviderRequestError,
  AiProviderTimeoutError,
} from "./providers/providerErrors";

const toAppError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }
  if (error instanceof AiProviderNotConfiguredError) {
    return new AppError(503, "AI generation is not configured on this server");
  }
  if (error instanceof NotEnoughCandidatesError) {
    return new AppError(503, "The item catalogue is unavailable, try again shortly");
  }
  if (error instanceof AiProviderTimeoutError) {
    return new AppError(504, "The AI provider took too long to respond");
  }
  if (error instanceof AiProviderRateLimitedError) {
    return new AppError(429, "The AI provider is rate limiting requests, try again shortly");
  }
  if (error instanceof AiInvalidOutputError) {
    return new AppError(502, "The AI provider returned an unusable result");
  }
  if (error instanceof AiProviderRequestError) {
    return new AppError(502, "The AI provider failed to answer");
  }
  return new AppError(500, "AI generation failed");
};

export class AiService {
  constructor(
    private readonly provider: TextProvider,
    private readonly lootGenerator: LootGenerator,
  ) {}

  async generateLoot(
    userId: string,
    payload: GenerateLootPayload,
  ): Promise<LootGeneration> {
    await requireCampaignDM(userId, payload.campaignId);

    const context = await loadCampaignLootContext(payload.campaignId);
    if (!context) {
      throw new AppError(404, "Campaign not found");
    }

    try {
      const { output, model } = await this.lootGenerator.generate(context, payload);
      return {
        meta: {
          id: randomUUID(),
          kind: AI_GENERATION_KIND.Loot,
          campaignId: payload.campaignId,
          provider: this.provider.id,
          model,
          createdAt: new Date().toISOString(),
        },
        input: payload,
        output,
      };
    } catch (error) {
      console.error("loot generation failed", error);
      throw toAppError(error);
    }
  }
}
