import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BoxberryClient } from "../src/client.js";

describe("BoxberryClient", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, BOXBERRY_API_TOKEN: "test-token-123" };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("throws when no token is set", () => {
    delete process.env.BOXBERRY_API_TOKEN;
    delete process.env.BOXBERRY_TOKEN;
    expect(() => new BoxberryClient()).toThrow("BOXBERRY_API_TOKEN");
  });

  it("accepts token via constructor", () => {
    delete process.env.BOXBERRY_API_TOKEN;
    delete process.env.BOXBERRY_TOKEN;
    expect(() => new BoxberryClient("direct-token")).not.toThrow();
  });

  it("falls back to BOXBERRY_TOKEN", () => {
    delete process.env.BOXBERRY_API_TOKEN;
    process.env.BOXBERRY_TOKEN = "fallback-token";
    expect(() => new BoxberryClient()).not.toThrow();
  });

  it("calls Boxberry API with correct URL", async () => {
    const mockData = [{ Code: "1", Name: "Москва" }];
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    const client = new BoxberryClient();
    const result = await client.call("ListCitiesFull");

    expect(fetchSpy).toHaveBeenCalledOnce();
    const url = fetchSpy.mock.calls[0][0] as string;
    expect(url).toContain("api.boxberry.ru");
    expect(url).toContain("token=test-token-123");
    expect(url).toContain("method=ListCitiesFull");
    expect(result).toEqual(mockData);
  });

  it("throws on Boxberry error response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ err: "Invalid token" }), { status: 200 })
    );

    const client = new BoxberryClient();
    await expect(client.call("ListCitiesFull")).rejects.toThrow("Boxberry: Invalid token");
  });

  it("throws on HTTP error", async () => {
    // Fresh Response per attempt: 500 is retried by mcp-core, and a Response
    // body can only be read once — one shared instance dies on retry 2.
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async () => new Response("Server Error", { status: 500 })
    );

    const client = new BoxberryClient();
    await expect(client.call("ListCitiesFull")).rejects.toThrow("Boxberry HTTP 500");
  }, 10_000); // 3 attempts with 1s + 2s backoff
});
