import { AI_PROVIDER_ID } from "@shared/constants/ai";
import type { AiProviderId } from "@shared/dto/ai";

export type AiRateLimitConfig = {
  windowMs: number;
  max: number;
};

export type AiConfig = {
  providerId: AiProviderId;
  geminiApiKey: string | null;
  geminiModel: string;
  timeoutMs: number;
  maxRetries: number;
  rateLimit: AiRateLimitConfig;
};

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_RATE_LIMIT_MAX = 10;

const readNumber = (raw: string | undefined, fallback: number): number => {
  if (!raw) {
    return fallback;
  }
  const value = Number.parseInt(raw, 10);
  return Number.isNaN(value) || value < 0 ? fallback : value;
};

const readProviderId = (raw: string | undefined, hasKey: boolean): AiProviderId => {
  if (raw === AI_PROVIDER_ID.Gemini) {
    return AI_PROVIDER_ID.Gemini;
  }
  if (raw === AI_PROVIDER_ID.Mock) {
    return AI_PROVIDER_ID.Mock;
  }
  return hasKey ? AI_PROVIDER_ID.Gemini : AI_PROVIDER_ID.Mock;
};

export const readAiConfig = (): AiConfig => {
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim() || null;
  return {
    providerId: readProviderId(process.env.AI_PROVIDER?.trim(), !!geminiApiKey),
    geminiApiKey,
    geminiModel: process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
    timeoutMs: readNumber(process.env.AI_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
    maxRetries: readNumber(process.env.AI_MAX_RETRIES, DEFAULT_MAX_RETRIES),
    rateLimit: {
      windowMs: readNumber(
        process.env.AI_RATE_LIMIT_WINDOW_MS,
        DEFAULT_RATE_LIMIT_WINDOW_MS,
      ),
      max: readNumber(process.env.AI_RATE_LIMIT_MAX, DEFAULT_RATE_LIMIT_MAX),
    },
  };
};
