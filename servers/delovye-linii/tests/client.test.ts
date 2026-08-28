import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DellinClient } from "../src/client.js";

// BaseHttpClient из ядра читает тело через response.text() и парсит JSON сам,
// поэтому моки отдают text(), а не json().
function okResponse(data: unknown) {
  return { ok: true, text: () => Promise.resolve(JSON.stringify(data)) };
}

describe("DellinClient", () => {
  const originalEnv = process.env.DELLIN_API_KEY;

  beforeEach(() => {
    process.env.DELLIN_API_KEY = "test-api-key";
  });

  afterEach(() => {
    if (originalEnv) {
      process.env.DELLIN_API_KEY = originalEnv;
    } else {
      delete process.env.DELLIN_API_KEY;
    }
    vi.restoreAllMocks();
  });

  it("throws if no API key is set", () => {
    delete process.env.DELLIN_API_KEY;
    expect(() => new DellinClient("")).toThrow("DELLIN_API_KEY обязательна");
  });

  it("constructs with explicit key", () => {
    const client = new DellinClient("explicit-key");
    expect(client).toBeInstanceOf(DellinClient);
  });

  it("constructs with env key", () => {
    process.env.DELLIN_API_KEY = "env-key";
    const client = new DellinClient();
    expect(client).toBeInstanceOf(DellinClient);
  });

  it("sends POST with appkey and returns data", async () => {
    const mockResponse = { cities: [{ cityID: 1, name: "Москва" }] };

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse(mockResponse)));

    const client = new DellinClient("test-key", "https://mock.api");
    const result = await client.post("/places", { q: "Москва" });

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      "https://mock.api/places.json",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"appkey":"test-key"'),
      }),
    );
  });

  it("throws on HTTP error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers(),
        text: () => Promise.resolve("Unauthorized"),
      }),
    );

    const client = new DellinClient("bad-key", "https://mock.api");
    await expect(client.post("/test")).rejects.toThrow("HTTP 401");
  });

  it("throws on API-level errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        okResponse({
          errors: [{ title: "Invalid param", detail: "city_id is required" }],
        }),
      ),
    );

    const client = new DellinClient("key", "https://mock.api");
    await expect(client.post("/test")).rejects.toThrow(
      "Invalid param: city_id is required",
    );
  });
});
