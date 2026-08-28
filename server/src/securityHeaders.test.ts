import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app";

const headersOf = async (path: string) => (await request(createApp()).get(path)).headers;

const directives = async () => {
  const policy = (await headersOf("/api/health"))["content-security-policy"];
  return Object.fromEntries(
    policy.split(";").map((part) => {
      const [name, ...sources] = part.trim().split(/\s+/);
      return [name, sources];
    }),
  ) as Record<string, string[]>;
};

describe("what the browser is told it may load", () => {
  it("allows nothing by default", async () => {
    expect((await directives())["default-src"]).toEqual(["'self'"]);
  });

  it("allows scripts from this origin and nowhere else", async () => {
    expect((await directives())["script-src"]).toEqual(["'self'"]);
  });

  it("allows the font stylesheet and the font files they come from", async () => {
    const policy = await directives();

    expect(policy["style-src"]).toContain("https://fonts.googleapis.com");
    expect(policy["font-src"]).toContain("https://fonts.gstatic.com");
  });

  it("allows the inline styles React writes onto elements", async () => {
    expect((await directives())["style-src"]).toContain("'unsafe-inline'");
  });

  it("allows the API and the socket, both of which are this origin", async () => {
    expect((await directives())["connect-src"]).toEqual(["'self'"]);
  });

  it("refuses plugins outright", async () => {
    expect((await directives())["object-src"]).toEqual(["'none'"]);
  });
});

describe("what the browser is told to refuse", () => {
  it("refuses to be framed by anyone", async () => {
    expect((await directives())["frame-ancestors"]).toEqual(["'none'"]);
  });

  it("refuses to guess a content type the server did not declare", async () => {
    expect((await headersOf("/api/health"))["x-content-type-options"]).toBe("nosniff");
  });

  it("refuses to leak the full URL to another site", async () => {
    expect((await headersOf("/api/health"))["referrer-policy"]).toBeDefined();
  });

  it("asks for HTTPS on every later visit", async () => {
    expect((await headersOf("/api/health"))["strict-transport-security"]).toContain(
      "max-age=",
    );
  });

  it("stops advertising which framework is answering", async () => {
    expect((await headersOf("/api/health"))["x-powered-by"]).toBeUndefined();
  });
});
