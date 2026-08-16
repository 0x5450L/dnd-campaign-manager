import { randomUUID } from "node:crypto";
import request from "supertest";
import { describe, expect, it } from "vitest";
import prisma from "../services/prisma";
import { app, registerUser } from "../testing/factories";

const credentials = () => ({
  email: `${randomUUID()}@example.test`,
  password: "correct-horse-battery",
  displayName: "Mira",
});

describe("POST /api/auth/register", () => {
  it("creates the user and returns a token", async () => {
    const body = credentials();
    const response = await request(app).post("/api/auth/register").send(body);

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      email: body.email,
      displayName: body.displayName,
    });
    expect(response.body.token).toEqual(expect.any(String));
  });

  it("sets an httpOnly cookie alongside the bearer token", async () => {
    const response = await request(app).post("/api/auth/register").send(credentials());

    const cookie = response.headers["set-cookie"][0];
    expect(cookie).toContain("token=");
    expect(cookie).toContain("HttpOnly");
  });

  it("never returns the password hash", async () => {
    const response = await request(app).post("/api/auth/register").send(credentials());

    expect(JSON.stringify(response.body)).not.toContain("passwordHash");
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  it("stores the password hashed rather than in the clear", async () => {
    const body = credentials();
    await request(app).post("/api/auth/register").send(body);

    const stored = await prisma.user.findUnique({ where: { email: body.email } });
    expect(stored?.passwordHash).not.toBe(body.password);
  });

  it("rejects a password short enough to guess", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ ...credentials(), password: "short" });

    expect(response.status).toBe(400);
  });

  it("rejects a password past the length bcrypt actually hashes", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ ...credentials(), password: "x".repeat(73) });

    expect(response.status).toBe(400);
  });

  it("rejects an unbounded display name", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ ...credentials(), displayName: "x".repeat(10_000) });

    expect(response.status).toBe(400);
  });

  it("rejects a malformed email", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ ...credentials(), email: "not-an-email" });

    expect(response.status).toBe(400);
  });

  it("rejects an empty password", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ ...credentials(), password: "" });

    expect(response.status).toBe(400);
  });

  it("reports a taken email as a conflict rather than a server fault", async () => {
    const body = credentials();
    await request(app).post("/api/auth/register").send(body);
    const second = await request(app).post("/api/auth/register").send(body);

    expect(second.status).toBe(409);
    expect(second.body.message).toBe("Email already registered");
    expect(await prisma.user.count({ where: { email: body.email } })).toBe(1);
  });

  it("does not leak file paths or query internals when a write fails", async () => {
    const body = credentials();
    await request(app).post("/api/auth/register").send(body);
    const second = await request(app).post("/api/auth/register").send(body);

    const serialised = JSON.stringify(second.body);
    expect(serialised).not.toMatch(/[A-Za-z]:\\|\/home\/|\/Users\//);
    expect(serialised).not.toContain("prisma.");
    expect(serialised).not.toContain("Invalid `");
  });
});

describe("POST /api/auth/login", () => {
  it("returns a token for valid credentials", async () => {
    const body = credentials();
    await request(app).post("/api/auth/register").send(body);

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: body.email, password: body.password });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
  });

  it("rejects a wrong password without revealing which field was wrong", async () => {
    const body = credentials();
    await request(app).post("/api/auth/register").send(body);

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: body.email, password: "wrong" });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid credentials");
  });

  it("answers an unknown email the same way as a wrong password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.test", password: "whatever" });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid credentials");
  });
});

describe("GET /api/me", () => {
  it("returns the caller identified by a bearer token", async () => {
    const user = await registerUser("Mira");

    const response = await request(app)
      .get("/api/me")
      .set("Authorization", `Bearer ${user.token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({ id: user.id, displayName: "Mira" });
  });

  it("accepts the token from the cookie as well", async () => {
    const user = await registerUser();

    const response = await request(app)
      .get("/api/me")
      .set("Cookie", [`token=${user.token}`]);

    expect(response.status).toBe(200);
    expect(response.body.user.id).toBe(user.id);
  });

  it("rejects a request with no token", async () => {
    const response = await request(app).get("/api/me");
    expect(response.status).toBe(401);
  });

  it("rejects a forged token", async () => {
    const response = await request(app)
      .get("/api/me")
      .set("Authorization", "Bearer not.a.real.token");

    expect(response.status).toBe(401);
  });

  it("answers an unknown route without exposing the stack", async () => {
    const user = await registerUser();

    const response = await request(app)
      .get("/api/campaigns/not-a-real-id")
      .set("Authorization", `Bearer ${user.token}`);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(JSON.stringify(response.body)).not.toContain("at ");
  });

  it("rejects a token signed for a user that no longer exists", async () => {
    const user = await registerUser();
    await prisma.user.delete({ where: { id: user.id } });

    const response = await request(app)
      .get("/api/me")
      .set("Authorization", `Bearer ${user.token}`);

    expect(response.status).toBe(404);
  });
});
