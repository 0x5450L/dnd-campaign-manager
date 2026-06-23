import type { CacheStore } from "./cacheStore";
import { MemoryCacheStore } from "./memoryCacheStore";
import { RedisCacheStore } from "./redisCacheStore";
import { ResilientCacheStore } from "./resilientCacheStore";

export function createCacheStore(): CacheStore {
  const connectionUrl = process.env.REDIS_URL;
  if (!connectionUrl) {
    return new MemoryCacheStore();
  }
  return new ResilientCacheStore(
    new RedisCacheStore(connectionUrl),
    new MemoryCacheStore(),
  );
}
