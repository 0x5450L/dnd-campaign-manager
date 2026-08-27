import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { createRateLimit } from "./middleware/rateLimit";

const CLIENT_A = "203.0.113.10";
const CLIENT_B = "203.0.113.20";

const buildProxiedApp = (trustProxy: number | boolean) => {
  const app = express();
  app.set("trust proxy", trustProxy);

  app.get("/probe", createRateLimit({ windowMs: 60_000, max: 1 }), (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(
    (
      err: Error & { statusCode?: number },
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      res.status(err.statusCode ?? 500).json({ message: err.message });
    },
  );

  return app;
};

const probeAs = (app: express.Express, clientIp: string) =>
  request(app).get("/probe").set("X-Forwarded-For", clientIp);

describe("what a limiter sees behind a load balancer", () => {
  it("gives each forwarded client its own budget when one hop is trusted", async () => {
    const app = buildProxiedApp(1);

    expect((await probeAs(app, CLIENT_A)).status).toBe(200);
    expect((await probeAs(app, CLIENT_B)).status).toBe(200);
    expect((await probeAs(app, CLIENT_A)).status).toBe(429);
  });

  it("pools every client into one budget when no hop is trusted", async () => {
    const app = buildProxiedApp(false);

    expect((await probeAs(app, CLIENT_A)).status).toBe(200);
    expect((await probeAs(app, CLIENT_B)).status).toBe(429);
  });

  it("ignores an address a caller prepends to the chain when one hop is trusted", async () => {
    const app = buildProxiedApp(1);

    await request(app).get("/probe").set("X-Forwarded-For", `${CLIENT_B}, ${CLIENT_A}`);
    const spoofed = await request(app)
      .get("/probe")
      .set("X-Forwarded-For", `${CLIENT_B}, ${CLIENT_A}`);

    expect(spoofed.status).toBe(429);
  });
});
