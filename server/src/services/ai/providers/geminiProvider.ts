import { AI_PROVIDER_ID } from "@shared/constants/ai";
import type { AiProviderId } from "@shared/dto/ai";
import { AbstractTextProvider } from "./abstractTextProvider";
import type { StructuredTextRequest, StructuredTextResult } from "./aiProvider";
import {
  readGeminiText,
  toGeminiSchema,
  type GeminiGenerateContentResponse,
} from "./mappers/gemini";
import {
  AiProviderBlockedError,
  AiProviderEmptyOutputError,
  AiProviderMalformedJsonError,
  AiProviderNotConfiguredError,
  AiProviderTruncatedError,
} from "./providerErrors";

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_TEMPERATURE = 0.9;
const FALLBACK_MAX_OUTPUT_TOKENS = 4096;
const TRUNCATED_FINISH_REASON = "MAX_TOKENS";
const SAFETY_FINISH_REASONS = new Set(["SAFETY", "BLOCKLIST", "PROHIBITED_CONTENT"]);

export type GeminiProviderOptions = {
  apiKey: string;
  model: string;
  timeoutMs: number;
  maxRetries: number;
  maxOutputTokens?: number;
};

export class GeminiProvider extends AbstractTextProvider {
  readonly id: AiProviderId = AI_PROVIDER_ID.Gemini;
  protected readonly timeoutMs: number;
  protected readonly maxRetries: number;
  private readonly apiKey: string;
  private readonly model: string;
  private readonly maxOutputTokens: number;

  constructor(options: GeminiProviderOptions) {
    super();
    if (!options.apiKey) {
      throw new AiProviderNotConfiguredError(
        AI_PROVIDER_ID.Gemini,
        "GEMINI_API_KEY is missing",
      );
    }
    this.apiKey = options.apiKey;
    this.model = options.model;
    this.timeoutMs = options.timeoutMs;
    this.maxRetries = options.maxRetries;
    this.maxOutputTokens = options.maxOutputTokens ?? FALLBACK_MAX_OUTPUT_TOKENS;
  }

  async generateStructured(
    request: StructuredTextRequest,
  ): Promise<StructuredTextResult> {
    const maxOutputTokens = request.maxOutputTokens ?? this.maxOutputTokens;
    const response = await this.postJson<GeminiGenerateContentResponse>({
      url: `${BASE_URL}/${this.model}:generateContent`,
      headers: { "x-goog-api-key": this.apiKey },
      body: {
        systemInstruction: { parts: [{ text: request.systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: request.userPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: toGeminiSchema(request.responseSchema),
          temperature: request.temperature ?? DEFAULT_TEMPERATURE,
          maxOutputTokens,
        },
      },
    });

    const { text, finishReason, blockReason } = readGeminiText(response);

    if (blockReason) {
      throw new AiProviderBlockedError(this.id, blockReason);
    }
    if (finishReason && SAFETY_FINISH_REASONS.has(finishReason)) {
      throw new AiProviderBlockedError(this.id, finishReason);
    }
    if (finishReason === TRUNCATED_FINISH_REASON) {
      throw new AiProviderTruncatedError(this.id, maxOutputTokens);
    }
    if (!text) {
      throw new AiProviderEmptyOutputError(this.id, finishReason);
    }

    try {
      return { data: JSON.parse(text) as unknown, model: this.model };
    } catch {
      throw new AiProviderMalformedJsonError(this.id);
    }
  }
}
