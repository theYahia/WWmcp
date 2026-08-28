import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("client", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("getSiteId throws when CALLTOUCH_SITE_ID is not set", async () => {
    delete process.env.CALLTOUCH_SITE_ID;
    const { getSiteId } = await import("../src/client.js");
    expect(() => getSiteId()).toThrow("CALLTOUCH_SITE_ID");
  });

  it("getSiteId returns value when set", async () => {
    process.env.CALLTOUCH_SITE_ID = "12345";
    const { getSiteId } = await import("../src/client.js");
    expect(getSiteId()).toBe("12345");
  });

  it("apiGet throws when CALLTOUCH_TOKEN is not set", async () => {
    delete process.env.CALLTOUCH_TOKEN;
    process.env.CALLTOUCH_SITE_ID = "12345";
    const { apiGet } = await import("../src/client.js");
    await expect(apiGet("/test")).rejects.toThrow("CALLTOUCH_TOKEN");
  });
});
