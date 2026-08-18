import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const OLD_ENV = { ...process.env };

function okResponse(body: unknown, text?: string) {
  return {
    ok: true,
    status: 200,
    headers: new Headers(),
    text: () => Promise.resolve(text ?? JSON.stringify(body)),
  };
}

function errResponse(status: number, body: string, headers: Record<string, string> = {}) {
  return {
    ok: false,
    status,
    statusText: "Error",
    headers: new Headers(headers),
    text: () => Promise.resolve(body),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.KAITEN_DOMAIN = "acme";
  process.env.KAITEN_TOKEN = "tok-123";
  delete process.env.KAITEN_BASE_URL;
});

afterEach(() => {
  process.env = { ...OLD_ENV };
});

describe("base URL resolution", () => {
  it("bare subdomain -> .kaiten.ru", async () => {
    const { _resolveBaseUrl } = await import("../src/client.js");
    expect(_resolveBaseUrl()).toBe("https://acme.kaiten.ru/api/latest");
  });

  it("full host with a dot is used as-is (covers .io)", async () => {
    process.env.KAITEN_DOMAIN = "acme.kaiten.io";
    const { _resolveBaseUrl } = await import("../src/client.js");
    expect(_resolveBaseUrl()).toBe("https://acme.kaiten.io/api/latest");
  });

  it("KAITEN_BASE_URL overrides and strips trailing slash", async () => {
    process.env.KAITEN_BASE_URL = "https://kaiten.corp.ru/api/latest/";
    const { _resolveBaseUrl } = await import("../src/client.js");
    expect(_resolveBaseUrl()).toBe("https://kaiten.corp.ru/api/latest");
  });

  it("throws when neither domain nor base url is set", async () => {
    delete process.env.KAITEN_DOMAIN;
    const { _resolveBaseUrl } = await import("../src/client.js");
    expect(() => _resolveBaseUrl()).toThrow("KAITEN_DOMAIN");
  });
});

describe("auth header", () => {
  it("uses Bearer token", async () => {
    const { _getAuthHeader } = await import("../src/client.js");
    expect(_getAuthHeader()).toBe("Bearer tok-123");
  });

  it("throws when token missing", async () => {
    delete process.env.KAITEN_TOKEN;
    const { _getAuthHeader } = await import("../src/client.js");
    expect(() => _getAuthHeader()).toThrow("KAITEN_TOKEN");
  });
});

describe("formatApiError", () => {
  it("extracts message from JSON body", async () => {
    const { _formatApiError } = await import("../src/client.js");
    expect(_formatApiError(400, JSON.stringify({ message: "bad board_id" }))).toContain("bad board_id");
  });

  it("falls back to raw text for non-JSON", async () => {
    const { _formatApiError } = await import("../src/client.js");
    expect(_formatApiError(500, "upstream down")).toBe("Kaiten HTTP 500: upstream down");
  });
});

describe("retryDelayMs", () => {
  it("prefers Retry-After header (seconds)", async () => {
    const { _retryDelayMs } = await import("../src/client.js");
    expect(_retryDelayMs(new Headers({ "Retry-After": "2" }), 1)).toBe(2000);
  });

  it("falls back to exponential backoff", async () => {
    const { _retryDelayMs } = await import("../src/client.js");
    expect(_retryDelayMs(new Headers(), 1)).toBe(1000);
    expect(_retryDelayMs(new Headers(), 2)).toBe(2000);
  });
});

describe("kaitenRequest", () => {
  it("GET builds the right URL and parses JSON", async () => {
    mockFetch.mockResolvedValue(okResponse([{ id: 1 }]));
    const { kaitenGet } = await import("../src/client.js");
    const result = await kaitenGet("/cards?board_id=5");
    expect(result).toEqual([{ id: 1 }]);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("https://acme.kaiten.ru/api/latest/cards?board_id=5");
    expect(init.method).toBe("GET");
    expect(init.headers.Authorization).toBe("Bearer tok-123");
  });

  it("returns {success:true} on empty body (e.g. 204)", async () => {
    mockFetch.mockResolvedValue(okResponse(null, ""));
    const { kaitenDelete } = await import("../src/client.js");
    expect(await kaitenDelete("/cards/9")).toEqual({ success: true });
  });

  it("throws a specific message on 401", async () => {
    mockFetch.mockResolvedValue(errResponse(401, "{}"));
    const { kaitenGet } = await import("../src/client.js");
    await expect(kaitenGet("/cards")).rejects.toThrow("auth error 401");
  });

  it("surfaces the error body on 4xx", async () => {
    mockFetch.mockResolvedValue(errResponse(422, JSON.stringify({ message: "title required" })));
    const { kaitenPost } = await import("../src/client.js");
    await expect(kaitenPost("/cards", {})).rejects.toThrow("title required");
  });

  it("retries on 429 then succeeds", async () => {
    mockFetch
      .mockResolvedValueOnce(errResponse(429, "rate", { "Retry-After": "0" }))
      .mockResolvedValueOnce(okResponse({ id: 7 }));
    const { kaitenGet } = await import("../src/client.js");
    expect(await kaitenGet("/cards/7")).toEqual({ id: 7 });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
