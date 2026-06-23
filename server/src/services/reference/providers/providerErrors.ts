import type { SrdCategory, SrdSource } from "../../../../../shared/srd";

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
    super(`no provider resolved category ${category} (${causes.length} attempt(s) failed)`);
    this.name = "NoProviderAvailableError";
  }
}
