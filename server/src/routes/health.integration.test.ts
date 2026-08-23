import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../testing/factories";

describe("GET /api/health", () => {
  it("answers without a token, because the platform probing it has none", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("reports uptime so a restart loop is visible in the response itself", async () => {
    const response = await request(app).get("/api/health");

    expect(response.body.uptime).toEqual(expect.any(Number));
  });

  it("names the build it is running, which is what a deploy verifies from outside", async () => {
    const response = await request(app).get("/api/health");

    expect(response.body).toHaveProperty("version");
  });
});
