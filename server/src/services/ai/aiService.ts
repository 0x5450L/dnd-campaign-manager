import { randomUUID } from "node:crypto";
import { AI_GENERATION_KIND } from "@shared/constants/ai";
import type {
  EncounterGeneration,
  GenerateEncounterPayload,
  GenerateLootPayload,
  LootGeneration,
} from "@shared/dto/ai";
import { requireCampaignDM, requireEncounterDM } from "../../utils/accessControl";
import { AppError } from "../../utils/errors";
import { loadCampaignLootContext } from "./aiContextRepository";
import {
  NoCreatureCandidatesError,
  type EncounterGenerator,
} from "./generators/encounterGenerator";
import {
  NotEnoughCandidatesError,
  type LootGenerator,
} from "./generators/lootGenerator";
import type { TextProvider } from "./providers/aiProvider";
import {
  AiInvalidOutputError,
  AiProviderBlockedError,
  AiProviderEmptyOutputError,
  AiProviderMalformedJsonError,
  AiProviderNotConfiguredError,
  AiProviderRateLimitedError,
  AiProviderRequestError,
  AiProviderTimeoutError,
  AiProviderTruncatedError,
} from "./providers/providerErrors";

const requestErrorMessage = (error: AiProviderRequestError): AppError => {
  switch (error.status) {
    case 400:
      return new AppError(
        502,
        "The AI provider rejected the request as malformed. This is a bug on our side, not something you did.",
      );
    case 401:
    case 403:
      return new AppError(
        503,
        "The AI provider rejected our API key. Check GEMINI_API_KEY on the server.",
      );
    case 404:
      return new AppError(
        503,
        "The configured AI model does not exist. Check GEMINI_MODEL on the server.",
      );
    case null:
      return new AppError(
        502,
        "Could not reach the AI provider. Check the server's network connection.",
      );
    default:
      return new AppError(
        502,
        `The AI provider answered with an error (HTTP ${error.status}). Try again in a moment.`,
      );
  }
};

const toAppError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }
  if (error instanceof AiProviderNotConfiguredError) {
    return new AppError(
      503,
      "AI generation is not configured on this server. Set GEMINI_API_KEY or switch AI_PROVIDER to mock.",
    );
  }
  if (error instanceof NotEnoughCandidatesError) {
    return new AppError(
      503,
      `The item catalogue offered only ${error.available} item(s) for the ${error.requested} you asked for. Try again shortly or ask for fewer items.`,
    );
  }
  if (error instanceof NoCreatureCandidatesError) {
    return new AppError(503, error.humanMessage);
  }
  if (error instanceof AiProviderTimeoutError) {
    return new AppError(
      504,
      `The AI provider did not answer within ${Math.round(error.timeoutMs / 1000)}s. Try again, or raise AI_TIMEOUT_MS.`,
    );
  }
  if (error instanceof AiProviderRateLimitedError) {
    return new AppError(
      429,
      "The AI provider is rate limiting us. Wait a moment and try again.",
    );
  }
  if (error instanceof AiProviderBlockedError) {
    return new AppError(
      422,
      "The AI provider refused this prompt as unsafe. Rewrite the context and try again.",
    );
  }
  if (error instanceof AiProviderTruncatedError) {
    return new AppError(
      502,
      `The AI provider ran out of room mid-answer (${error.maxOutputTokens} token budget). Ask for fewer creatures, or raise AI_MAX_OUTPUT_TOKENS.`,
    );
  }
  if (error instanceof AiProviderEmptyOutputError) {
    return new AppError(
      502,
      "The AI provider returned an empty answer. Try again — this is usually transient.",
    );
  }
  if (error instanceof AiProviderMalformedJsonError) {
    return new AppError(
      502,
      "The AI provider returned something that is not valid JSON. Try again.",
    );
  }
  if (error instanceof AiInvalidOutputError) {
    return new AppError(
      502,
      `The AI provider broke the rules of the request (${error.issues[0] ?? "schema mismatch"}). Try again.`,
    );
  }
  if (error instanceof AiProviderRequestError) {
    return requestErrorMessage(error);
  }
  return new AppError(500, "AI generation failed for an unexpected reason");
};

export class AiService {
  constructor(
    private readonly provider: TextProvider,
    private readonly lootGenerator: LootGenerator,
    private readonly encounterGenerator: EncounterGenerator,
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

  async generateEncounter(
    userId: string,
    payload: GenerateEncounterPayload,
  ): Promise<EncounterGeneration> {
    const access = await requireEncounterDM(userId, payload.encounterId);
    if (access.campaignSession.campaign.id !== payload.campaignId) {
      throw new AppError(404, "Encounter not found");
    }

    const context = await loadCampaignLootContext(payload.campaignId);
    if (!context) {
      throw new AppError(404, "Campaign not found");
    }

    try {
      const { output, model } = await this.encounterGenerator.generate(
        context,
        payload,
      );
      return {
        meta: {
          id: randomUUID(),
          kind: AI_GENERATION_KIND.Encounter,
          campaignId: payload.campaignId,
          provider: this.provider.id,
          model,
          createdAt: new Date().toISOString(),
        },
        input: payload,
        output,
      };
    } catch (error) {
      console.error("encounter generation failed", error);
      throw toAppError(error);
    }
  }
}
