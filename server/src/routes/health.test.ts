import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import prisma from "../services/prisma";
import healthRoutes from "./health";

vi.mock("../services/prisma", () => ({
  default: { $queryRaw: vi.fn() },
}));

const probe = vi.mocked(prisma.$queryRaw);

const app = express();
app.use("/api/health", healthRoutes);

beforeEach(() => {
  probe.mockReset();
});

describe("GET /api/health/ready when the database is gone", () => {
  it("answers 503 rather than pretending the service can work", async () => {
    probe.mockRejectedValue(new Error("connection refused"));

    const response = await request(app).get("/api/health/ready");

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("unavailable");
  });

  it("still names the build, so a failing deploy says which one failed", async () => {
    probe.mockRejectedValue(new Error("connection refused"));

    const response = await request(app).get("/api/health/ready");

    expect(response.body).toHaveProperty("version");
  });

  it("answers 200 as soon as the database answers again", async () => {
    probe.mockResolvedValue([{ "?column?": 1 }]);

    const response = await request(app).get("/api/health/ready");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ready");
  });
});
