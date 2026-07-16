import type { SrdCategory, SrdSource } from "@shared/dto/srd";

export class ProviderUnsupportedError extends Error {
  constructor(
    readonly source: SrdSource,
    readonly category: SrdCategory,
  ) {
    super(`provider ${source} does not support category ${category}`);
    this.name = "ProviderUnsupportedError";
  }
}

export class ProviderRequestError extends Error {
  constructor(
    readonly source: SrdSource,
    readonly status: number | null,
    message: string,
  ) {
    super(message);
    this.name = "ProviderRequestError";
  }
}

export class NoProviderAvailableError extends Error {
  constructor(
    readonly category: SrdCategory,
    readonly causes: unknown[],
  ) {
    const detail = causes
      .map((cause) => (cause instanceof Error ? cause.message : String(cause)))
      .join("; ");
    super(
      `no provider resolved category ${category} (${causes.length} attempt(s) failed)` +
        (detail ? `: ${detail}` : ""),
    );
    this.name = "NoProviderAvailableError";
  }
}
