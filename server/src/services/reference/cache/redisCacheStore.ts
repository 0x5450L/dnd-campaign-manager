import Redis from "ioredis";
import type { CacheStore } from "./cacheStore";

export class RedisCacheStore implements CacheStore {
  private readonly client: Redis;

  constructor(connectionUrl: string) {
    this.client = new Redis(connectionUrl, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.client.set(key, value, "EX", ttlSeconds);
  }

  async close(): Promise<void> {
    await this.client.quit();
  }
}
