import { AI_PROVIDER_ID } from "@shared/constants/ai";
import type { AiConfig } from "../config";
import type { TextProvider } from "./aiProvider";
import { GeminiProvider } from "./geminiProvider";
import { MockTextProvider } from "./mockProvider";
import { AiProviderNotConfiguredError } from "./providerErrors";

export const createTextProvider = (config: AiConfig): TextProvider => {
  if (config.providerId === AI_PROVIDER_ID.Mock) {
    return new MockTextProvider();
  }

  if (!config.geminiApiKey) {
    throw new AiProviderNotConfiguredError(
      AI_PROVIDER_ID.Gemini,
      "AI_PROVIDER is set to gemini but GEMINI_API_KEY is missing",
    );
  }

  return new GeminiProvider({
    apiKey: config.geminiApiKey,
    model: config.geminiModel,
    timeoutMs: config.timeoutMs,
    maxRetries: config.maxRetries,
    maxOutputTokens: config.maxOutputTokens,
  });
};
