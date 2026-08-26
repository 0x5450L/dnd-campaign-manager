import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";

type Bucket = {
  count: number;
  resetAt: number;
};

export type RateLimitOptions = {
  windowMs: number;
  max: number;
  message?: string;
  countWhen?: (res: Response) => boolean;
};

const SWEEP_INTERVAL_MS = 60_000;

const registry = new Set<() => void>();

export const resetRateLimits = () => {
  for (const clear of registry) {
    clear();
  }
};

export const createRateLimit = ({
  windowMs,
  max,
  message = "Too many requests, slow down",
  countWhen,
}: RateLimitOptions) => {
  const buckets = new Map<string, Bucket>();
  let lastSweepAt = Date.now();

  registry.add(() => buckets.clear());

  const sweep = (now: number) => {
    if (now - lastSweepAt < SWEEP_INTERVAL_MS) {
      return;
    }
    lastSweepAt = now;
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) {
        buckets.delete(key);
      }
    }
  };

  const charge = (key: string, now: number) => {
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return;
    }
    bucket.count += 1;
  };

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    sweep(now);

    const key = req.userId ?? req.ip ?? "anonymous";
    const bucket = buckets.get(key);
    const active = bucket && bucket.resetAt > now ? bucket : null;

    if (active && active.count >= max) {
      res.setHeader(
        "Retry-After",
        Math.max(1, Math.ceil((active.resetAt - now) / 1000)),
      );
      next(new AppError(429, message));
      return;
    }

    if (countWhen) {
      res.on("finish", () => {
        if (countWhen(res)) {
          charge(key, Date.now());
        }
      });
    } else {
      charge(key, now);
    }

    next();
  };
};
