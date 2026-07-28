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
};

const SWEEP_INTERVAL_MS = 60_000;

export const createRateLimit = ({
  windowMs,
  max,
  message = "Too many requests, slow down",
}: RateLimitOptions) => {
  const buckets = new Map<string, Bucket>();
  let lastSweepAt = Date.now();

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

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    sweep(now);

    const key = req.userId ?? req.ip ?? "anonymous";
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (bucket.count >= max) {
      res.setHeader(
        "Retry-After",
        Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      );
      next(new AppError(429, message));
      return;
    }

    bucket.count += 1;
    next();
  };
};
