import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { tildaGet, parseRetryAfter } from "../src/client.js";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  process.env.TILDA_PUBLIC_KEY = "test-pub";
  process.env.TILDA_SECRET_KEY = "test-sec";
  mockFetch.mockReset();
});

afterEach(() => {
  delete process.env.TILDA_PUBLIC_KEY;
  delete process.env.TILDA_SECRET_KEY;
  vi.useRealTimers();
});

function ok(result: unknown) {
  return { ok: true, json: () => Promise.resolve({ status: "FOUND", result }) };
}
function status(code: number, retryAfter: string | null = null) {
  return {
    ok: false,
    status: code,
    statusText: `HTTP ${code}`,
    headers: { get: (name: string) => (name.toLowerCase() === "retry-after" ? retryAfter : null) },
  };
}

describe("parseRetryAfter", () => {
  it("parses delta-seconds", () => {
    expect(parseRetryAfter("2")).toBe(2000);
    expect(parseRetryAfter("0")).toBe(0);
  });
  it("returns null for missing/garbage", () => {
    expect(parseRetryAfter(null)).toBeNull();
    expect(parseRetryAfter("soon")).toBeNull();
  });
  it("parses HTTP-date into a future delay", () => {
    const future = new Date(Date.now() + 5000).toUTCString();
    const ms = parseRetryAfter(future);
    expect(ms).not.toBeNull();
    expect(ms!).toBeGreaterThan(2000);
    expect(ms!).toBeLessThanOrEqual(5000);
  });
});

describe("tildaGet retries", () => {
  it("retries on 429 then succeeds", async () => {
    mockFetch.mockResolvedValueOnce(status(429)).mockResolvedValueOnce(ok([{ id: "1" }]));
    vi.useFakeTimers();
    const promise = tildaGet("getprojectslist");
    await vi.runAllTimersAsync();
    expect(await promise).toEqual([{ id: "1" }]);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("retries on 500 then succeeds", async () => {
    mockFetch.mockResolvedValueOnce(status(500)).mockResolvedValueOnce(ok({ ok: true }));
    vi.useFakeTimers();
    const promise = tildaGet("getprojectinfo", { projectid: "1" });
    await vi.runAllTimersAsync();
    expect(await promise).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("throws after exhausting retries on persistent 500", async () => {
    mockFetch.mockResolvedValue(status(500));
    vi.useFakeTimers();
    const captured = tildaGet("getprojectslist").catch((e: unknown) => e);
    await vi.runAllTimersAsync();
    const err = await captured;
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toContain("Tilda HTTP 500");
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("retries on timeout (AbortError) then succeeds", async () => {
    const abort = new DOMException("timed out", "AbortError");
    mockFetch.mockRejectedValueOnce(abort).mockResolvedValueOnce(ok("done"));
    vi.useFakeTimers();
    const promise = tildaGet("getprojectslist");
    await vi.runAllTimersAsync();
    expect(await promise).toBe("done");
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("honours a Retry-After header and still retries to success", async () => {
    mockFetch.mockResolvedValueOnce(status(429, "5")).mockResolvedValueOnce(ok("ok"));
    vi.useFakeTimers();
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const promise = tildaGet("getprojectslist");
    await vi.runAllTimersAsync();
    expect(await promise).toBe("ok");
    expect(mockFetch).toHaveBeenCalledTimes(2);
    // Retry-After=5s must win over the 1s backoff → a 5000ms wait was scheduled.
    const delays = setTimeoutSpy.mock.calls.map((c) => Number(c[1]));
    expect(delays).toContain(5000);
    setTimeoutSpy.mockRestore();
  });
});
