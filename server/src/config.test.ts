import { afterEach, describe, expect, it, vi } from "vitest";

const BASE_ENV = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
  JWT_SECRET: "secret",
};

const loadConfig = async (overrides: Record<string, string | undefined> = {}) => {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", "development");
  for (const [key, value] of Object.entries({ ...BASE_ENV, ...overrides })) {
    vi.stubEnv(key, value as string);
  }
  return (await import("./config.js")).config;
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("required settings", () => {
  it("refuses to start without a database url", async () => {
    await expect(loadConfig({ DATABASE_URL: undefined })).rejects.toThrow(
      /DATABASE_URL/,
    );
  });

  it("refuses to start without a signing secret", async () => {
    await expect(loadConfig({ JWT_SECRET: undefined })).rejects.toThrow(/JWT_SECRET/);
  });

  it("names every missing setting at once rather than the first", async () => {
    await expect(
      loadConfig({ DATABASE_URL: undefined, JWT_SECRET: undefined }),
    ).rejects.toThrow(/DATABASE_URL[\s\S]*JWT_SECRET/);
  });
});

describe("port", () => {
  it("falls back to 3001", async () => {
    expect((await loadConfig()).port).toBe(3001);
  });

  it("reads a numeric port from a string", async () => {
    expect((await loadConfig({ PORT: "8080" })).port).toBe(8080);
  });

  it("rejects a port that is not a number", async () => {
    await expect(loadConfig({ PORT: "http" })).rejects.toThrow(/PORT/);
  });
});

describe("origins and the cookie that follows from them", () => {
  it("serves a single origin by default, so the cookie stays same-site", async () => {
    const config = await loadConfig();

    expect(config.allowedOrigins).toEqual([]);
    expect(config.cookie.sameSite).toBe("lax");
    expect(config.cookie.secure).toBe(false);
  });

  it("keeps the cookie secure in production even on one origin", async () => {
    const config = await loadConfig({ NODE_ENV: "production" });

    expect(config.cookie.sameSite).toBe("lax");
    expect(config.cookie.secure).toBe(true);
  });

  it("loosens sameSite only once the client lives elsewhere", async () => {
    const config = await loadConfig({ CORS_ORIGINS: "https://dnd.example.com" });

    expect(config.allowedOrigins).toEqual(["https://dnd.example.com"]);
    expect(config.cookie.sameSite).toBe("none");
    expect(config.cookie.secure).toBe(true);
  });

  it("splits and trims a list of origins", async () => {
    const config = await loadConfig({
      CORS_ORIGINS: " https://a.example.com , https://b.example.com ",
    });

    expect(config.allowedOrigins).toEqual([
      "https://a.example.com",
      "https://b.example.com",
    ]);
  });

  it("treats an empty list as no origins at all", async () => {
    const config = await loadConfig({ CORS_ORIGINS: "  ,  " });

    expect(config.allowedOrigins).toEqual([]);
    expect(config.cookie.sameSite).toBe("lax");
  });
});

describe("optional settings", () => {
  it("reports absent optional settings as null rather than undefined", async () => {
    const config = await loadConfig();

    expect(config.redisUrl).toBeNull();
    expect(config.clientDistPath).toBeNull();
    expect(config.buildVersion).toBeNull();
  });

  it("treats a blank build version as no version at all", async () => {
    expect((await loadConfig({ BUILD_VERSION: "  " })).buildVersion).toBeNull();
  });

  it("reports the build version the image was stamped with", async () => {
    expect((await loadConfig({ BUILD_VERSION: "a1b2c3d" })).buildVersion).toBe("a1b2c3d");
  });
});
