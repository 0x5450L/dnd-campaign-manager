import type { CacheStore } from "./cacheStore";

export class ResilientCacheStore implements CacheStore {
  constructor(
    private readonly primary: CacheStore,
    private readonly fallback: CacheStore,
  ) {}

  async get(key: string): Promise<string | null> {
    try {
      return await this.primary.get(key);
    } catch {
      return this.fallback.get(key);
    }
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    try {
      await this.primary.set(key, value, ttlSeconds);
    } catch {
      await this.fallback.set(key, value, ttlSeconds);
    }
  }

  async close(): Promise<void> {
    await Promise.allSettled([this.primary.close(), this.fallback.close()]);
  }
}
