import type { AiProviderId } from "@shared/dto/ai";

export class AiProviderNotConfiguredError extends Error {
  constructor(readonly provider: AiProviderId, detail: string) {
    super(`ai provider ${provider} is not configured: ${detail}`);
    this.name = "AiProviderNotConfiguredError";
  }
}

export class AiProviderRequestError extends Error {
  constructor(
    readonly provider: AiProviderId,
    readonly status: number | null,
    message: string,
  ) {
    super(message);
    this.name = "AiProviderRequestError";
  }
}

export class AiProviderTimeoutError extends Error {
  constructor(
    readonly provider: AiProviderId,
    readonly timeoutMs: number,
  ) {
    super(`ai provider ${provider} timed out after ${timeoutMs}ms`);
    this.name = "AiProviderTimeoutError";
  }
}

export class AiProviderRateLimitedError extends Error {
  constructor(
    readonly provider: AiProviderId,
    readonly retryAfterMs: number | null,
  ) {
    super(`ai provider ${provider} rejected the request with a rate limit`);
    this.name = "AiProviderRateLimitedError";
  }
}

export class AiInvalidOutputError extends Error {
  constructor(
    readonly provider: AiProviderId,
    readonly issues: string[],
  ) {
    super(
      `ai provider ${provider} returned output that failed schema validation: ${issues.join("; ")}`,
    );
    this.name = "AiInvalidOutputError";
  }
}
