import { describe, it, expect, vi, afterEach } from "vitest";
import { BaseHttpClient } from "../src/client.js";

const abort = () => new DOMException("The operation was aborted", "AbortError");
const socketError = (code: string) =>
  Object.assign(new TypeError("fetch failed"), {
    cause: Object.assign(new Error("socket hang up"), { code }),
  });
const ok = () => new Response(JSON.stringify({ ok: true }), { status: 200 });

function client() {
  return new BaseHttpClient({ baseUrl: "https://erp.example.com", maxRetries: 3 });
}

describe("BaseHttpClient — retries never repeat a mutation", () => {
  afterEach(() => vi.restoreAllMocks());

  it("POST on timeout: exactly one fetch, error warns to check the database", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockRejectedValue(abort());
    await expect(
      client().request({ method: "POST", path: "/doc", body: { a: 1 } }),
    ).rejects.toThrow(/не создан ли объект/);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("POST on 500: exactly one fetch, error warns to check the database", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("boom", { status: 500 }));
    await expect(
      client().request({ method: "POST", path: "/doc", body: { a: 1 } }),
    ).rejects.toThrow(/не создан ли объект/);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("PATCH on ECONNRESET: exactly one fetch, error warns to check the database", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(socketError("ECONNRESET"));
    await expect(
      client().request({ method: "PATCH", path: "/doc", body: { a: 1 } }),
    ).rejects.toThrow(/не создан ли объект/);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("GET retries a timeout twice and returns the third answer", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(abort())
      .mockRejectedValueOnce(abort())
      .mockResolvedValueOnce(ok());
    await expect(client().request({ method: "GET", path: "/doc" })).resolves.toEqual({
      ok: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("GET retries a socket error (ECONNRESET) and returns the second answer", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(socketError("ECONNRESET"))
      .mockResolvedValueOnce(ok());
    await expect(client().request({ method: "GET", path: "/doc" })).resolves.toEqual({
      ok: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("GET rethrows a non-retryable socket error untouched", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(socketError("ECONNREFUSED"));
    await expect(client().request({ method: "GET", path: "/doc" })).rejects.toThrow(
      /fetch failed/,
    );
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

/**
 * Логи ретрая уходят в stderr клиента MCP и живут там неопределённо долго.
 * В $filter к чужой базе лежат ИНН контрагентов, GUID и суммы — им там не место.
 */
describe("BaseHttpClient — retry logs never carry the query string", () => {
  afterEach(() => vi.restoreAllMocks());

  /** Логгер, который запоминает всё, что ему отдали. */
  function recordingLogger() {
    const lines: string[] = [];
    const rec = (msg: string, data?: Record<string, unknown>) =>
      void lines.push(msg + " " + JSON.stringify(data ?? {}));
    return { lines, logger: { debug: rec, info: rec, warn: rec, error: rec } };
  }

  const SECRET_PATH =
    "/odata/standard.odata/Catalog_Контрагенты?$filter=ИНН eq '7712345678' and Сумма gt 100500";

  it("503 → backoff warning keeps the entity but drops $filter with ИНН and sums", async () => {
    const { lines, logger } = recordingLogger();
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("boom", { status: 503 }))
      .mockResolvedValueOnce(ok());
    const c = new BaseHttpClient({ baseUrl: "https://erp.example.com", maxRetries: 3, logger });

    await expect(c.request({ method: "GET", path: SECRET_PATH })).resolves.toEqual({ ok: true });

    const out = lines.join(" | ");
    expect(out).toContain("Retryable error");
    expect(out).not.toContain("7712345678");
    expect(out).not.toContain("100500");
    expect(out).not.toContain("$filter");
    expect(out).toContain("/odata/standard.odata/Catalog_Контрагенты"); // диагностика жива
  });

  it("timeout and socket-error warnings drop it too", async () => {
    const { lines, logger } = recordingLogger();
    vi.spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(abort())
      .mockRejectedValueOnce(socketError("ECONNRESET"))
      .mockResolvedValueOnce(ok());
    const c = new BaseHttpClient({ baseUrl: "https://erp.example.com", maxRetries: 3, logger });

    await expect(c.request({ method: "GET", path: SECRET_PATH })).resolves.toEqual({ ok: true });

    const out = lines.join(" | ");
    expect(out).toContain("Request timeout");
    expect(out).toContain("Network error");
    expect(out).not.toContain("7712345678");
    expect(out).not.toContain("$filter");
  });
});
