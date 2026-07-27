import type { AiProviderId } from "@shared/dto/ai";
import type {
  StructuredTextRequest,
  StructuredTextResult,
  TextProvider,
} from "./aiProvider";
import {
  AiProviderRateLimitedError,
  AiProviderRequestError,
  AiProviderTimeoutError,
} from "./providerErrors";

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const BASE_BACKOFF_MS = 400;
const MAX_BACKOFF_MS = 8_000;

export type PostJsonOptions = {
  url: string;
  headers: Record<string, string>;
  body: unknown;
};

export abstract class AbstractTextProvider implements TextProvider {
  abstract readonly id: AiProviderId;
  protected abstract readonly timeoutMs: number;
  protected abstract readonly maxRetries: number;

  abstract generateStructured(
    request: StructuredTextRequest,
  ): Promise<StructuredTextResult>;

  protected async postJson<TResponse>(
    options: PostJsonOptions,
  ): Promise<TResponse> {
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      try {
        return await this.sendOnce<TResponse>(options);
      } catch (error) {
        lastError = error;
        if (!this.isRetryable(error) || attempt === this.maxRetries) {
          throw error;
        }
        await this.wait(this.backoffMs(attempt, error));
      }
    }

    throw lastError;
  }

  private async sendOnce<TResponse>({
    url,
    headers,
    body,
  }: PostJsonOptions): Promise<TResponse> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...headers,
        },
        body: JSON.stringify(body),
      });

      if (response.status === 429) {
        throw new AiProviderRateLimitedError(
          this.id,
          this.parseRetryAfterMs(response.headers.get("retry-after")),
        );
      }

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new AiProviderRequestError(
          this.id,
          response.status,
          `${this.id} responded ${response.status}${detail ? `: ${detail.slice(0, 300)}` : ""}`,
        );
      }

      return (await response.json()) as TResponse;
    } catch (error) {
      if (
        error instanceof AiProviderRequestError ||
        error instanceof AiProviderRateLimitedError
      ) {
        throw error;
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new AiProviderTimeoutError(this.id, this.timeoutMs);
      }
      const reason = error instanceof Error ? error.message : "unknown error";
      throw new AiProviderRequestError(
        this.id,
        null,
        `${this.id} request failed: ${reason}`,
      );
    } finally {
      clearTimeout(timer);
    }
  }

  private isRetryable(error: unknown): boolean {
    if (error instanceof AiProviderRateLimitedError) {
      return true;
    }
    if (error instanceof AiProviderTimeoutError) {
      return true;
    }
    if (error instanceof AiProviderRequestError) {
      return error.status === null || RETRYABLE_STATUS.has(error.status);
    }
    return false;
  }

  private backoffMs(attempt: number, error: unknown): number {
    if (
      error instanceof AiProviderRateLimitedError &&
      error.retryAfterMs !== null
    ) {
      return Math.min(error.retryAfterMs, MAX_BACKOFF_MS);
    }
    const exponential = BASE_BACKOFF_MS * 2 ** attempt;
    const jitter = Math.random() * BASE_BACKOFF_MS;
    return Math.min(exponential + jitter, MAX_BACKOFF_MS);
  }

  private parseRetryAfterMs(header: string | null): number | null {
    if (!header) {
      return null;
    }
    const seconds = Number.parseFloat(header);
    return Number.isNaN(seconds) ? null : Math.round(seconds * 1000);
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
