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
