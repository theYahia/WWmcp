import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { elmaRequest, getDomain, getToken } from "../src/client.js";

describe("client", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.ELMA365_DOMAIN = "testdomain";
    process.env.ELMA365_TOKEN = "test-token-123";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  describe("getDomain", () => {
    it("returns domain from env", () => {
      expect(getDomain()).toBe("testdomain");
    });

    it("throws if ELMA365_DOMAIN not set", () => {
      delete process.env.ELMA365_DOMAIN;
      expect(() => getDomain()).toThrow("ELMA365_DOMAIN не задан");
    });
  });

  describe("getToken", () => {
    it("returns token from env", () => {
      expect(getToken()).toBe("test-token-123");
    });

    it("throws if ELMA365_TOKEN not set", () => {
      delete process.env.ELMA365_TOKEN;
      expect(() => getToken()).toThrow("ELMA365_TOKEN не задан");
    });
  });

  describe("elmaRequest", () => {
    it("makes GET request with Bearer auth", async () => {
      const mockResponse = { result: [{ id: "1" }] };
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 }),
      );

      const result = await elmaRequest("GET", "tasks/list");
      expect(result).toEqual(mockResponse);
      expect(fetchSpy).toHaveBeenCalledOnce();

      const [url, opts] = fetchSpy.mock.calls[0];
      expect(String(url)).toBe("https://testdomain.elma365.ru/pub/v1/tasks/list");
      expect((opts as RequestInit).headers).toEqual(
        expect.objectContaining({ Authorization: "Bearer test-token-123" }),
      );
    });

    it("makes POST request with body", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ id: "new" }), { status: 200 }),
      );

      await elmaRequest("POST", "app/ns/code/create", { name: "Test" });
      const [, opts] = fetchSpy.mock.calls[0];
      expect((opts as RequestInit).method).toBe("POST");
      expect((opts as RequestInit).body).toBe(JSON.stringify({ name: "Test" }));
    });

    it("appends query params", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      await elmaRequest("GET", "user/list", undefined, { from: "0", size: "10" });
      const [url] = fetchSpy.mock.calls[0];
      expect(String(url)).toContain("?from=0&size=10");
    });

    it("handles full domain with dots", async () => {
      process.env.ELMA365_DOMAIN = "my.custom.domain.ru";
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({}), { status: 200 }),
      );

      await elmaRequest("GET", "test");
      const [url] = fetchSpy.mock.calls[0];
      expect(String(url)).toBe("https://my.custom.domain.ru/pub/v1/test");
    });

    it("honours ELMA365_BASE_URL override (on-premise)", async () => {
      process.env.ELMA365_BASE_URL = "https://elma365.corp.local/pub/v1";
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({}), { status: 200 }),
      );

      await elmaRequest("GET", "tasks/list");
      const [url] = fetchSpy.mock.calls[0];
      expect(String(url)).toBe("https://elma365.corp.local/pub/v1/tasks/list");
    });

    it("throws on 4xx error", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("Not Found", { status: 404, statusText: "Not Found" }),
      );

      await expect(elmaRequest("GET", "missing")).rejects.toThrow("ELMA365 HTTP 404");
    });

    it("retries on 500", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response("Error", { status: 500, statusText: "Internal Server Error" }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

      const result = await elmaRequest("GET", "retry-test");
      expect(result).toEqual({ ok: true });
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it("retries on 429", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response("Rate limited", { status: 429, statusText: "Too Many Requests" }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

      const result = await elmaRequest("GET", "rate-limit-test");
      expect(result).toEqual({ ok: true });
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });
});
