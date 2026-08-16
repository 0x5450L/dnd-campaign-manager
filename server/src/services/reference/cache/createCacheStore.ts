import { config } from "../../../config";
import type { CacheStore } from "./cacheStore";
import { MemoryCacheStore } from "./memoryCacheStore";
import { RedisCacheStore } from "./redisCacheStore";
import { ResilientCacheStore } from "./resilientCacheStore";

export function createCacheStore(): CacheStore {
  const connectionUrl = config.redisUrl;
  if (!connectionUrl) {
    return new MemoryCacheStore();
  }
  return new ResilientCacheStore(
    new RedisCacheStore(connectionUrl),
    new MemoryCacheStore(),
  );
}
