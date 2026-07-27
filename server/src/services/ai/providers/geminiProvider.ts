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
  AiProviderNotConfiguredError,
  AiProviderRequestError,
} from "./providerErrors";

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_TEMPERATURE = 0.9;
const DEFAULT_MAX_OUTPUT_TOKENS = 2048;

export type GeminiProviderOptions = {
  apiKey: string;
  model: string;
  timeoutMs: number;
  maxRetries: number;
};

export class GeminiProvider extends AbstractTextProvider {
  readonly id: AiProviderId = AI_PROVIDER_ID.Gemini;
  protected readonly timeoutMs: number;
  protected readonly maxRetries: number;
  private readonly apiKey: string;
  private readonly model: string;

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
  }

  async generateStructured(
    request: StructuredTextRequest,
  ): Promise<StructuredTextResult> {
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
          maxOutputTokens: request.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
        },
      },
    });

    const text = readGeminiText(response);
    if (!text) {
      throw new AiProviderRequestError(
        this.id,
        null,
        `${this.id} returned no usable content`,
      );
    }

    try {
      return { data: JSON.parse(text) as unknown, model: this.model };
    } catch {
      throw new AiProviderRequestError(
        this.id,
        null,
        `${this.id} returned malformed JSON`,
      );
    }
  }
}
