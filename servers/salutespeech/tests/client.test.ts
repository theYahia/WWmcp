import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { API_BASE, getAuthKey, maybeTlsHint } from "../src/client.js";

const OAUTH = { access_token: "T", expires_at: 9_999_999_999_999 };

function res(status: number, opts: { json?: unknown; text?: string; ok?: boolean } = {}) {
  return {
    ok: opts.ok ?? (status >= 200 && status < 300),
    status,
    statusText: String(status),
    json: async () => opts.json ?? {},
    text: async () => opts.text ?? JSON.stringify(opts.json ?? {}),
    arrayBuffer: async () => new ArrayBuffer(0),
  } as unknown as Response;
}

describe("API_BASE", () => {
  it("is the SaluteSpeech REST base", () => {
    expect(API_BASE).toBe("https://smartspeech.sber.ru/rest/v1");
  });
});

describe("getAuthKey priority", () => {
  const original = { ...process.env };
  beforeEach(() => {
    delete process.env.SALUTESPEECH_API_KEY;
    delete process.env.SALUTE_AUTH_KEY;
    delete process.env.SALUTE_SPEECH_CLIENT_ID;
    delete process.env.SALUTE_SPEECH_CLIENT_SECRET;
  });
  afterEach(() => {
    process.env = { ...original };
  });

  it("prefers SALUTESPEECH_API_KEY over the legacy alias", () => {
    process.env.SALUTESPEECH_API_KEY = "key-api";
    process.env.SALUTE_AUTH_KEY = "key-legacy";
    expect(getAuthKey()).toBe("key-api");
  });

  it("falls back to the legacy SALUTE_AUTH_KEY", () => {
    process.env.SALUTE_AUTH_KEY = "key-legacy";
    expect(getAuthKey()).toBe("key-legacy");
  });

  it("derives Base64 from client id + secret", () => {
    process.env.SALUTE_SPEECH_CLIENT_ID = "test-id";
    process.env.SALUTE_SPEECH_CLIENT_SECRET = "test-secret";
    expect(getAuthKey()).toBe("dGVzdC1pZDp0ZXN0LXNlY3JldA==");
  });

  it("throws when no credentials are set", () => {
    expect(() => getAuthKey()).toThrow(/Auth not configured/);
  });
});

describe("maybeTlsHint", () => {
  it("rewraps a Russian-CA cert error with an actionable hint", () => {
    const err = Object.assign(new TypeError("fetch failed"), {
      cause: Object.assign(new Error("self-signed certificate in certificate chain"), {
        code: "SELF_SIGNED_CERT_IN_CHAIN",
      }),
    });
    const out = maybeTlsHint(err) as Error;
    expect(out).toBeInstanceOf(Error);
    expect(out.message).toMatch(/NODE_EXTRA_CA_CERTS/);
    expect(out.message).toMatch(/gosuslugi|Минцифры/);
  });

  it("passes through unrelated errors untouched", () => {
    const err = new Error("totally unrelated");
    expect(maybeTlsHint(err)).toBe(err);
  });
});

describe("salutePost retry logic", () => {
  const original = { ...process.env };
  let originalFetch: typeof globalThis.fetch;
  beforeEach(() => {
    originalFetch = global.fetch;
    process.env.SALUTESPEECH_API_KEY = "dGVzdA==";
    vi.resetModules();
  });
  afterEach(() => {
    global.fetch = originalFetch;
    process.env = { ...original };
    vi.restoreAllMocks();
  });

  it("retries on HTTP 429 then succeeds", async () => {
    const queue = [res(429, { ok: false }), res(200, { json: { result: ["ok"] } })];
    const fetchMock = vi.fn(async (url: string) =>
      String(url).includes("oauth") ? res(200, { json: OAUTH }) : queue.shift()!,
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const { salutePost } = await import("../src/client.js");
    const r = await salutePost("/speech:recognize", Buffer.from("x"), "audio/mpeg");
    expect(r.status).toBe(200);
    const apiCalls = fetchMock.mock.calls.filter((c) => String(c[0]).includes("smartspeech"));
    expect(apiCalls.length).toBe(2);
  }, 8000);

  it("throws after exhausting retries on HTTP 500", async () => {
    const fetchMock = vi.fn(async (url: string) =>
      String(url).includes("oauth") ? res(200, { json: OAUTH }) : res(500, { ok: false, text: "boom" }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const { salutePost } = await import("../src/client.js");
    await expect(salutePost("/speech:recognize", Buffer.from("x"), "audio/mpeg")).rejects.toThrow(/HTTP 500/);
    const apiCalls = fetchMock.mock.calls.filter((c) => String(c[0]).includes("smartspeech"));
    expect(apiCalls.length).toBe(3);
  }, 9000);

  it("retries on an aborted (timeout) request", async () => {
    let n = 0;
    const fetchMock = vi.fn(async (url: string) => {
      if (String(url).includes("oauth")) return res(200, { json: OAUTH });
      n += 1;
      if (n === 1) throw new DOMException("aborted", "AbortError");
      return res(200, { json: { result: ["ok"] } });
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { salutePost } = await import("../src/client.js");
    const r = await salutePost("/speech:recognize", Buffer.from("x"), "audio/mpeg");
    expect(r.status).toBe(200);
    expect(n).toBe(2);
  });
});
