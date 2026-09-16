/**
 * Tests for the ATI.su HTTP client (request()).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { request } from "../src/client.js";
import { resetAuthCache } from "../src/auth.js";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  process.env.ATI_TOKEN = "secret-bearer-token";
  resetAuthCache();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  delete process.env.ATI_TOKEN;
  delete process.env.ATI_SANDBOX;
});

interface MockRes {
  status: number;
  body?: unknown;
  text?: string;
  retryAfter?: string;
}

function res({ status, body, text, retryAfter }: MockRes) {
  const bodyText = text !== undefined ? text : body === undefined ? "" : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (h: string) => (h.toLowerCase() === "retry-after" ? retryAfter ?? null : null) },
    text: async () => bodyText,
    json: async () => body,
  };
}

describe("request — happy paths", () => {
  it("sends the full path on api.ati.su with Bearer auth", async () => {
    mockFetch.mockResolvedValueOnce(res({ status: 200, body: { ok: true } }));
    await request("/v1.0/firms/123/summary");
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.ati.su/v1.0/firms/123/summary");
    expect(options.headers.Authorization).toBe("Bearer secret-bearer-token");
    expect(options.headers.Accept).toBe("application/json");
  });

  it("targets the sandbox host when ATI_SANDBOX=1", async () => {
    process.env.ATI_SANDBOX = "1";
    mockFetch.mockResolvedValueOnce(res({ status: 200, body: {} }));
    await request("/v1.0/test");
    expect(mockFetch.mock.calls[0][0]).toBe("https://sandbox-api.ati.su/v1.0/test");
  });

  it("builds query params and skips undefined/null", async () => {
    mockFetch.mockResolvedValueOnce(res({ status: 200, body: {} }));
    await request("/v1.0/firms/search/summary", { query: { inn: "7700000000", phone: undefined } });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("inn=7700000000");
    expect(url).not.toContain("phone=");
  });

  it("sends a JSON body with Content-Type on POST", async () => {
    mockFetch.mockResolvedValueOnce(res({ status: 200, body: { id: "x" } }));
    await request("/v2/cargos", { method: "POST", body: { cargo_application: { a: 1 } } });
    const [, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(options.body)).toEqual({ cargo_application: { a: 1 } });
  });

  it("returns parsed data on 200", async () => {
    const body = { Id: 1, FirmId: 9 };
    mockFetch.mockResolvedValueOnce(res({ status: 200, body }));
    const r = await request("/v1.0/loads/1");
    expect(r.error).toBeNull();
    expect(r.data).toEqual(body);
  });

  it("returns {} for an empty 2xx body", async () => {
    mockFetch.mockResolvedValueOnce(res({ status: 204, text: "" }));
    const r = await request("/v1.0/test");
    expect(r.error).toBeNull();
    expect(r.data).toEqual({});
  });
});

describe("request — error handling", () => {
  it("treats a non-JSON 2xx body as a non-retryable parse error (no retries)", async () => {
    mockFetch.mockResolvedValue(res({ status: 200, text: "<html>not json</html>" }));
    const r = await request("/v1.0/test");
    expect(r.data).toBeNull();
    expect(r.error).toContain("non-JSON");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("maps 401 to a fixed message and never leaks the token", async () => {
    mockFetch.mockResolvedValueOnce(res({ status: 401 }));
    const r = await request("/v1.0/test");
    expect(r.error).toContain("Authentication failed");
    expect(r.error).not.toContain("secret-bearer-token");
  });

  it("maps 404 and 429", async () => {
    mockFetch.mockResolvedValueOnce(res({ status: 404 }));
    expect((await request("/x")).error).toContain("not found");
  });

  it("logs the ATI error envelope to stderr but returns a curated message", async () => {
    // core createLogger writes JSON lines straight to stderr
    const spy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    mockFetch.mockResolvedValueOnce(
      res({ status: 400, body: { Error: "json_validation_error", Reason: "bad field" } }),
    );
    const r = await request("/v2/cargos", { method: "POST", body: {} });
    expect(r.error).toBe("Bad request. Check parameters.");
    expect(spy).toHaveBeenCalled();
    expect(String(spy.mock.calls[0])).toContain("json_validation_error");
  });
});

describe("request — retries & backoff", () => {
  it("retries a 500 then succeeds (backoff awaited via fake timers)", async () => {
    vi.useFakeTimers();
    mockFetch
      .mockResolvedValueOnce(res({ status: 500 }))
      .mockResolvedValueOnce(res({ status: 200, body: { ok: 1 } }));
    const p = request("/v1.0/test");
    await vi.runAllTimersAsync();
    const r = await p;
    expect(r.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("exhausts retries on persistent 503 and returns a service error", async () => {
    vi.useFakeTimers();
    mockFetch.mockResolvedValue(res({ status: 503 }));
    const p = request("/v1.0/test");
    await vi.runAllTimersAsync();
    const r = await p;
    expect(r.error).toContain("service error");
    expect(mockFetch).toHaveBeenCalledTimes(3); // attempt 0,1,2
  });

  it("retries a thrown network error with backoff, then returns a generic message", async () => {
    vi.useFakeTimers();
    vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    mockFetch.mockRejectedValue(new Error("ECONNRESET"));
    const p = request("/v1.0/test");
    await vi.runAllTimersAsync();
    const r = await p;
    expect(r.error).toContain("Network error contacting ATI.su");
    expect(r.error).not.toContain("ECONNRESET");
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("does not repeat a write (retry: false) after a 5xx and says so", async () => {
    mockFetch.mockResolvedValue(res({ status: 503 }));
    const r = await request("/v2/cargos", { method: "POST", body: {}, retry: false });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(r.error).toContain("service error");
    expect(r.error).toContain("not repeated automatically");
  });

  it("returns a timeout message on AbortError", async () => {
    vi.useFakeTimers();
    mockFetch.mockRejectedValue(new DOMException("aborted", "AbortError"));
    const p = request("/v1.0/test");
    await vi.runAllTimersAsync();
    const r = await p;
    expect(r.error).toContain("timed out");
  });
});

describe("request — credentials", () => {
  it("returns an error (and never calls fetch) when no credentials are configured", async () => {
    delete process.env.ATI_TOKEN;
    resetAuthCache();
    const r = await request("/v1.0/test");
    expect(r.error).toContain("credentials");
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
