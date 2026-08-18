import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("client auth", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    delete process.env.MOYSKLAD_TOKEN;
    delete process.env.MOYSKLAD_LOGIN;
    delete process.env.MOYSKLAD_PASSWORD;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("uses Bearer token when MOYSKLAD_TOKEN is set", async () => {
    process.env.MOYSKLAD_TOKEN = "test-token-123";
    const { _getAuthHeader } = await import("../src/client.js");
    expect(_getAuthHeader()).toBe("Bearer test-token-123");
  });

  it("uses Basic auth when LOGIN and PASSWORD are set", async () => {
    process.env.MOYSKLAD_LOGIN = "admin@company";
    process.env.MOYSKLAD_PASSWORD = "secret";
    const { _getAuthHeader } = await import("../src/client.js");
    const expected = `Basic ${Buffer.from("admin@company:secret").toString("base64")}`;
    expect(_getAuthHeader()).toBe(expected);
  });

  it("prefers token over basic auth", async () => {
    process.env.MOYSKLAD_TOKEN = "my-token";
    process.env.MOYSKLAD_LOGIN = "admin";
    process.env.MOYSKLAD_PASSWORD = "pass";
    const { _getAuthHeader } = await import("../src/client.js");
    expect(_getAuthHeader()).toBe("Bearer my-token");
  });

  it("throws when no auth is configured", async () => {
    const { _getAuthHeader } = await import("../src/client.js");
    expect(() => _getAuthHeader()).toThrow("Auth not configured");
  });
});
