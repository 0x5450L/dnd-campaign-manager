type UuidSource = { randomUUID: () => string };

export const randomId = (): string =>
  (globalThis.crypto as unknown as UuidSource).randomUUID();
