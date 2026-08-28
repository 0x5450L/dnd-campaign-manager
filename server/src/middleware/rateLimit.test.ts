import express, { type Express, type NextFunction, type Request, type Response } from "express";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../utils/errors";
import { createRateLimit, resetRateLimits, type RateLimitOptions } from "./rateLimit";

const WINDOW_MS = 60_000;

let now = 1_700_000_000_000;

const at = (offsetMs: number) => {
  now = 1_700_000_000_000 + offsetMs;
};

const buildApp = (options: RateLimitOptions): Express => {
  const app = express();
  const limiter = createRateLimit(options);

  app.use((req, _res, next) => {
    const asUser = req.headers["x-test-user"];
    if (typeof asUser === "string") {
      req.userId = asUser;
    }
    next();
  });

  app.get("/ok", limiter, (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.get("/denied", limiter, (_req, res) => {
    res.status(401).json({ status: "error" });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    res.status(statusCode).json({ message: err.message });
  });

  return app;
};

beforeEach(() => {
  at(0);
  vi.spyOn(Date, "now").mockImplementation(() => now);
  resetRateLimits();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createRateLimit counting every request", () => {
  it("lets through exactly as many requests as the ceiling allows", async () => {
    const app = buildApp({ windowMs: WINDOW_MS, max: 3 });

    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await request(app).get("/ok");
      expect(response.status).toBe(200);
    }
  });

  it("answers 429 past the ceiling and says how long to wait", async () => {
    const app = buildApp({ windowMs: WINDOW_MS, max: 2 });

    await request(app).get("/ok");
    await request(app).get("/ok");
    const blocked = await request(app).get("/ok");

    expect(blocked.status).toBe(429);
    expect(blocked.headers["retry-after"]).toBe("60");
  });

  it("carries the configured message into the refusal", async () => {
    const app = buildApp({ windowMs: WINDOW_MS, max: 1, message: "Slow down there" });

    await request(app).get("/ok");
    const blocked = await request(app).get("/ok");

    expect(blocked.body.message).toBe("Slow down there");
  });

  it("forgets the bucket once the window has passed", async () => {
    const app = buildApp({ windowMs: WINDOW_MS, max: 1 });

    await request(app).get("/ok");
    expect((await request(app).get("/ok")).status).toBe(429);

    at(WINDOW_MS + 1);

    expect((await request(app).get("/ok")).status).toBe(200);
  });

  it("keeps a separate bucket per authenticated user", async () => {
    const app = buildApp({ windowMs: WINDOW_MS, max: 1 });

    await request(app).get("/ok").set("x-test-user", "mira");

    const miraAgain = await request(app).get("/ok").set("x-test-user", "mira");
    const borin = await request(app).get("/ok").set("x-test-user", "borin");

    expect(miraAgain.status).toBe(429);
    expect(borin.status).toBe(200);
  });
});

describe("createRateLimit counting only matching responses", () => {
  const failuresOnly: RateLimitOptions = {
    windowMs: WINDOW_MS,
    max: 2,
    countWhen: (res) => res.statusCode === 401,
  };

  it("never spends the budget on responses that do not match", async () => {
    const app = buildApp(failuresOnly);

    for (let attempt = 0; attempt < 10; attempt++) {
      expect((await request(app).get("/ok")).status).toBe(200);
    }
  });

  it("spends the budget on responses that do match", async () => {
    const app = buildApp(failuresOnly);

    expect((await request(app).get("/denied")).status).toBe(401);
    expect((await request(app).get("/denied")).status).toBe(401);
    expect((await request(app).get("/denied")).status).toBe(429);
  });

  it("blocks the matching and the non-matching route alike once the budget is gone", async () => {
    const app = buildApp(failuresOnly);

    await request(app).get("/denied");
    await request(app).get("/denied");

    expect((await request(app).get("/ok")).status).toBe(429);
  });
});

describe("resetRateLimits", () => {
  it("clears the buckets of every limiter built so far", async () => {
    const app = buildApp({ windowMs: WINDOW_MS, max: 1 });

    await request(app).get("/ok");
    expect((await request(app).get("/ok")).status).toBe(429);

    resetRateLimits();

    expect((await request(app).get("/ok")).status).toBe(200);
  });
});
