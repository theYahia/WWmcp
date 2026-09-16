import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiGet } from "../client.js";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const TOKEN = "SECRET-TOKEN-XYZ";

function mockEnvelope(response: unknown, status: "ok" | "error" = "ok", errorMsg?: string) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    json: () =>
      Promise.resolve(status === "ok" ? { status, response } : { status, error: errorMsg }),
  };
}

function mockHttp(status: number, retryAfter: string | null = null) {
  return {
    ok: false,
    status,
    statusText: "Error",
    headers: { get: (h: string) => (h.toLowerCase() === "retry-after" ? retryAfter : null) },
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
  };
}

beforeEach(() => {
  mockFetch.mockReset();
  process.env.TGSTAT_TOKEN = TOKEN;
});

describe("apiGet — auth token", () => {
  it("sends the token in the request URL", async () => {
    mockFetch.mockResolvedValueOnce(mockEnvelope({ ok: 1 }));
    await apiGet("/channels/get", { channelId: "@x" });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain(`token=${TOKEN}`);
    expect(url).toContain("channelId=%40x");
  });

  it("returns an error (does not throw) when the token is missing", async () => {
    delete process.env.TGSTAT_TOKEN;
    const res = await apiGet("/channels/get", { channelId: "@x" });
    expect(res.data).toBeNull();
    expect(res.error).toContain("TGSTAT_TOKEN");
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe("apiGet — envelope unwrapping", () => {
  it("unwraps status:ok into data", async () => {
    mockFetch.mockResolvedValueOnce(mockEnvelope({ id: "1", title: "T" }));
    const res = await apiGet("/channels/get", { channelId: "@x" });
    expect(res.error).toBeNull();
    expect(res.data).toEqual({ id: "1", title: "T" });
  });

  it("turns a status:error envelope (HTTP 200) into an ApiResult error", async () => {
    mockFetch.mockResolvedValueOnce(mockEnvelope(null, "error", "channel not found"));
    const res = await apiGet("/channels/get", { channelId: "@bad" });
    expect(res.data).toBeNull();
    expect(res.error).toContain("channel not found");
  });
});

describe("apiGet — HTTP errors & retries", () => {
  it("maps 4xx to a friendly error without retrying", async () => {
    mockFetch.mockResolvedValueOnce(mockHttp(401));
    const res = await apiGet("/channels/get", { channelId: "@x" });
    expect(res.error).toContain("TGSTAT_TOKEN");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("retries on 429 and then succeeds", async () => {
    vi.useFakeTimers();
    try {
      mockFetch.mockResolvedValueOnce(mockHttp(429));
      mockFetch.mockResolvedValueOnce(mockEnvelope({ ok: 1 }));
      const p = apiGet("/channels/get", { channelId: "@x" });
      await vi.runAllTimersAsync();
      const res = await p;
      expect(res.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("apiGet — security: token never logged", () => {
  it("does not write the token to logs, even on the retry path", async () => {
    // mcp-core createLogger writes straight to process.stderr, not console.error.
    const spy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    vi.useFakeTimers();
    try {
      mockFetch.mockResolvedValueOnce(mockHttp(500));
      mockFetch.mockResolvedValueOnce(mockEnvelope({ ok: 1 }));
      const p = apiGet("/channels/get", { channelId: "@x" });
      await vi.runAllTimersAsync();
      await p;
      expect(spy).toHaveBeenCalled(); // a retry must have been logged for this test to mean anything
      for (const call of spy.mock.calls) {
        const line = call.map(String).join(" ");
        expect(line).not.toContain(TOKEN);
        expect(line).not.toContain("token=");
      }
    } finally {
      vi.useRealTimers();
      spy.mockRestore();
    }
  });
});
