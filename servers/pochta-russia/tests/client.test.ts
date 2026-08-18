import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PochtaClient, HOSTS, getAuth, type PochtaAuth } from "../src/client.js";

const AUTH: PochtaAuth = { token: "ACCESS_TOKEN", userBasic: "QkFTRTY0" };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("auth header contract", () => {
  it("sends AccessToken in Authorization and Basic in X-User-Authorization", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));
    const client = new PochtaClient({ auth: AUTH });

    await client.get("/tariff");

    const [, init] = fetchMock.mock.calls[0];
    const headers = init.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("AccessToken ACCESS_TOKEN");
    expect(headers["X-User-Authorization"]).toBe("Basic QkFTRTY0");
  });

  it("omits auth headers when authed:false (free tariff API)", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));
    const client = new PochtaClient({ auth: AUTH });

    await client.request("GET", "/calculate", undefined, { host: HOSTS.tariff, authed: false });

    const [url, init] = fetchMock.mock.calls[0];
    const headers = init.headers as Record<string, string>;
    expect(headers["Authorization"]).toBeUndefined();
    expect(headers["X-User-Authorization"]).toBeUndefined();
    expect(String(url)).toContain("tariff.pochta.ru/v2/calculate");
  });
});

describe("host routing", () => {
  it("hits postoffice base without a doubled /1.0", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ "postal-code": "101000" }));
    const client = new PochtaClient({ auth: AUTH });

    await client.get("/101000", undefined, { host: HOSTS.postoffice });

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://otpravka-api.pochta.ru/postoffice/1.0/101000");
    expect(String(url)).not.toContain("/1.0/postoffice/1.0");
  });

  it("defaults to the otpravka /1.0 host and preserves the prefix", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));
    const client = new PochtaClient({ auth: AUTH });

    await client.post("/tariff", { mass: 1000 });

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://otpravka-api.pochta.ru/1.0/tariff");
  });

  it("appends query params", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([]));
    const client = new PochtaClient({ auth: AUTH });

    await client.get("/nearby", { settlement: "Москва", top: "5", region: undefined }, {
      host: HOSTS.postoffice,
    });

    const [url] = fetchMock.mock.calls[0];
    const parsed = new URL(String(url));
    expect(parsed.searchParams.get("settlement")).toBe("Москва");
    expect(parsed.searchParams.get("top")).toBe("5");
    expect(parsed.searchParams.has("region")).toBe(false); // undefined dropped
  });
});

describe("retry & error handling", () => {
  it("retries on 503 then succeeds", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ err: "busy" }, 503))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));
    const client = new PochtaClient({ auth: AUTH, maxRetries: 1 });

    const result = await client.get<{ ok: boolean }>("/tariff");
    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does NOT retry on 401 and surfaces the error", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ desc: "bad token" }, 401));
    const client = new PochtaClient({ auth: AUTH, maxRetries: 3 });

    await expect(client.get("/tariff")).rejects.toThrow(/401.*bad token/s);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("maps an AbortError to a timeout message", async () => {
    fetchMock.mockRejectedValueOnce(Object.assign(new Error("aborted"), { name: "AbortError" }));
    const client = new PochtaClient({ auth: AUTH, maxRetries: 2 });

    await expect(client.get("/tariff")).rejects.toThrow(/таймаут/);
    expect(fetchMock).toHaveBeenCalledTimes(1); // timeout is not retried
  });

  it("extracts desc from a JSON error body", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ desc: "Неверный индекс" }, 400));
    const client = new PochtaClient({ auth: AUTH });

    await expect(client.get("/tariff")).rejects.toThrow(/Неверный индекс/);
  });
});

describe("getAuth", () => {
  it("builds userBasic from login + password", () => {
    vi.stubEnv("POCHTA_TOKEN", "T");
    vi.stubEnv("POCHTA_LOGIN", "user");
    vi.stubEnv("POCHTA_PASSWORD", "pass");
    vi.stubEnv("POCHTA_KEY", "");
    const auth = getAuth();
    expect(auth.token).toBe("T");
    expect(auth.userBasic).toBe(Buffer.from("user:pass").toString("base64"));
  });

  it("accepts a pre-computed POCHTA_KEY as userBasic", () => {
    vi.stubEnv("POCHTA_TOKEN", "T");
    vi.stubEnv("POCHTA_LOGIN", "");
    vi.stubEnv("POCHTA_PASSWORD", "");
    vi.stubEnv("POCHTA_KEY", "Basic QUJD");
    const auth = getAuth();
    expect(auth.userBasic).toBe("QUJD"); // "Basic " prefix stripped
  });

  it("throws when credentials are missing", () => {
    vi.stubEnv("POCHTA_TOKEN", "");
    vi.stubEnv("POCHTA_LOGIN", "");
    vi.stubEnv("POCHTA_PASSWORD", "");
    vi.stubEnv("POCHTA_KEY", "");
    expect(() => getAuth()).toThrow(/Требуется авторизация/);
  });
});

describe("tracking without credentials", () => {
  it("throws a clear error when login/password are absent", async () => {
    vi.stubEnv("POCHTA_LOGIN", "");
    vi.stubEnv("POCHTA_PASSWORD", "");
    const client = new PochtaClient({ auth: AUTH });
    await expect(client.trackByBarcode("RA123456789RU")).rejects.toThrow(/POCHTA_LOGIN/);
  });
});
