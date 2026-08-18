import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const TOKEN_FILE = join(tmpdir(), `hf-client-test-${process.pid}.json`);
process.env.HUNTFLOW_TOKEN_FILE = TOKEN_FILE;
process.env.HUNTFLOW_DISABLE_RATELIMIT = "1";
process.env.HUNTFLOW_BACKOFF_MS = "0";

import { hfGet, __resetClientForTests } from "../src/client.js";

const mockOk = (data: unknown) => ({ ok: true, status: 200, json: async () => data });
const mockErr = (status: number, type: string) => ({
  ok: false,
  status,
  statusText: "Error",
  text: async () => JSON.stringify({ errors: [{ type }] }),
  headers: { get: () => null },
});

beforeEach(() => {
  mockFetch.mockReset();
  rmSync(TOKEN_FILE, { force: true });
  process.env.HUNTFLOW_TOKEN = "t0";
  delete process.env.HUNTFLOW_REFRESH_TOKEN;
  __resetClientForTests();
});

describe("hfGet retry", () => {
  it("ретраит 429 и возвращает успех", async () => {
    mockFetch.mockResolvedValueOnce(mockErr(429, "rate")).mockResolvedValueOnce(mockOk({ ok: 1 }));
    const r = (await hfGet("/x")) as { ok: number };
    expect(r.ok).toBe(1);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("бросает после исчерпания ретраев на постоянном 500", async () => {
    mockFetch.mockResolvedValue(mockErr(500, "server_error"));
    await expect(hfGet("/x")).rejects.toThrow(/500|server_error/);
    expect(mockFetch).toHaveBeenCalledTimes(3); // MAX_RETRIES
  });
});

describe("401 → refresh", () => {
  it("рефрешит токен, персистит новую пару и повторяет запрос", async () => {
    process.env.HUNTFLOW_REFRESH_TOKEN = "r0";
    __resetClientForTests();

    mockFetch
      .mockResolvedValueOnce(mockErr(401, "token_expired"))
      .mockResolvedValueOnce(mockOk({ access_token: "newA", refresh_token: "newR" }))
      .mockResolvedValueOnce(mockOk({ done: true }));

    const r = (await hfGet("/data")) as { done: boolean };
    expect(r.done).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(3);

    // 2-й вызов — refresh
    const refreshUrl = mockFetch.mock.calls[1][0] as string;
    const refreshInit = mockFetch.mock.calls[1][1] as RequestInit;
    expect(refreshUrl).toContain("/token/refresh");
    expect(JSON.parse(refreshInit.body as string).refresh_token).toBe("r0");

    // 3-й вызов — повтор с новым access-токеном
    const retryInit = mockFetch.mock.calls[2][1] as RequestInit;
    expect((retryInit.headers as Record<string, string>)["Authorization"]).toBe("Bearer newA");

    // новая пара сохранена в файл
    const saved = JSON.parse(readFileSync(TOKEN_FILE, "utf8"));
    expect(saved.access_token).toBe("newA");
    expect(saved.refresh_token).toBe("newR");
  });

  it("без refresh-токена бросает 401 и не ретраит", async () => {
    mockFetch.mockResolvedValueOnce(mockErr(401, "bad_authorization"));
    await expect(hfGet("/data")).rejects.toThrow(/401/);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe("конфигурация токена", () => {
  it("бросает до запроса при отсутствии HUNTFLOW_TOKEN", async () => {
    delete process.env.HUNTFLOW_TOKEN;
    __resetClientForTests();
    await expect(hfGet("/x")).rejects.toThrow(/HUNTFLOW_TOKEN/);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("шлёт обязательный User-Agent в каждом запросе", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({}));
    await hfGet("/x");
    const headers = (mockFetch.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(headers["User-Agent"]).toMatch(/huntflow-mcp/);
  });
});
