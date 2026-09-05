/**
 * Бэкофф, таймауты и обновление токена в `BaseHttpClient`.
 *
 * `retry.test.ts` рядом отвечает на вопрос «повторили или нет». Здесь — «через
 * сколько и сколько раз»: паузы между попытками, потолок паузы, ветки статусов,
 * которые повторять нельзя, и ветка 401 → invalidate → повтор, единственная, где
 * клиент повторяет ДАЖЕ мутацию (запрос отбит на авторизации, до применения).
 *
 * Сеть не трогается: `fetch` подменён. Паузы не выжидаются по-настоящему —
 * `setTimeout` подменён так, что таймер бэкоффа срабатывает сразу, а его
 * запрошенная длительность записывается.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { BaseHttpClient, RateLimitedClient, ApiError } from "../src/client.js";

/** Заведомо недостижимая длительность — по ней узнаём таймер AbortController. */
const ABORT_MS = 99_999;

const ok = (body = '{"ok":true}') => new Response(body, { status: 200 });
const status = (code: number) => new Response("boom", { status: code });

/**
 * Записывает длительности пауз бэкоффа и прогоняет их мгновенно.
 * Таймер отмены (ABORT_MS) остаётся настоящим и в тесте не срабатывает.
 */
function captureBackoff() {
  const delays: number[] = [];
  const real = globalThis.setTimeout;
  vi.stubGlobal("setTimeout", ((fn: () => void, ms?: number, ...rest: unknown[]) => {
    if (ms === ABORT_MS) return real(fn, ms, ...(rest as []));
    delays.push(ms ?? 0);
    return real(fn, 0);
  }) as typeof setTimeout);
  return delays;
}

function client(maxRetries = 3) {
  return new BaseHttpClient({
    baseUrl: "https://api.example.com",
    maxRetries,
    timeout: ABORT_MS,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("BaseHttpClient — экспоненциальный бэкофф", () => {
  it("GET на 503: паузы удваиваются — 1с, затем 2с", async () => {
    const delays = captureBackoff();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(status(503))
      .mockResolvedValueOnce(status(503))
      .mockResolvedValueOnce(ok());

    await expect(client().request({ method: "GET", path: "/x" })).resolves.toEqual({
      ok: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(delays).toEqual([1000, 2000]);
  });

  it("пауза упирается в потолок 8с и дальше не растёт", async () => {
    const delays = captureBackoff();
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => status(500));

    await expect(client(7).request({ method: "GET", path: "/x" })).rejects.toThrow(ApiError);
    // 6 пауз на 7 попыток: 1, 2, 4, 8, 8, 8 — четвёртая и дальше срезаны потолком.
    expect(delays).toEqual([1000, 2000, 4000, 8000, 8000, 8000]);
  });

  it("последняя попытка не спит впустую перед тем, как бросить ошибку", async () => {
    const delays = captureBackoff();
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => status(502));

    await expect(client(3).request({ method: "GET", path: "/x" })).rejects.toThrow(/HTTP 502/);
    expect(delays).toHaveLength(2); // 3 попытки → 2 паузы
  });

  it("429 для GET повторяется наравне с 5xx", async () => {
    const delays = captureBackoff();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(status(429))
      .mockResolvedValueOnce(ok());

    await expect(client().request({ method: "GET", path: "/x" })).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(delays).toEqual([1000]);
  });

  it("таймаут и обрыв сокета повторяются БЕЗ паузы — ждать нечему", async () => {
    const delays = captureBackoff();
    vi.spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new DOMException("aborted", "AbortError"))
      .mockRejectedValueOnce(
        Object.assign(new TypeError("fetch failed"), {
          cause: Object.assign(new Error("socket hang up"), { code: "ECONNRESET" }),
        }),
      )
      .mockResolvedValueOnce(ok());

    await expect(client().request({ method: "GET", path: "/x" })).resolves.toEqual({ ok: true });
    expect(delays).toEqual([]);
  });
});

describe("BaseHttpClient — что повторять нельзя", () => {
  for (const code of [400, 404, 409, 422]) {
    it(`${code} не повторяется даже для GET — ответ не изменится`, async () => {
      const delays = captureBackoff();
      const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async () => status(code));

      await expect(client().request({ method: "GET", path: "/x" })).rejects.toThrow(
        new RegExp(`HTTP ${code}`),
      );
      expect(fetchMock).toHaveBeenCalledOnce();
      expect(delays).toEqual([]);
    });
  }

  it("POST на 503 не повторяется, но и не спит перед отказом", async () => {
    const delays = captureBackoff();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async () => status(503));

    await expect(client().request({ method: "POST", path: "/doc" })).rejects.toThrow(
      /не создан ли объект/,
    );
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(delays).toEqual([]);
  });

  it("HEAD считается идемпотентным и повторяется", async () => {
    captureBackoff();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(status(503))
      .mockResolvedValueOnce(ok());

    await expect(client().request({ method: "HEAD", path: "/x" })).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("BaseHttpClient — таймаут", () => {
  it("запрос действительно отменяется по истечении своего таймаута", async () => {
    // Настоящие таймеры: проверяется, что AbortController доходит до fetch.
    vi.spyOn(globalThis, "fetch").mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          (init as RequestInit).signal?.addEventListener("abort", () =>
            reject(new DOMException("aborted", "AbortError")),
          );
        }),
    );
    const c = new BaseHttpClient({
      baseUrl: "https://api.example.com",
      maxRetries: 1,
      timeout: 30,
    });
    await expect(c.request({ method: "GET", path: "/slow" })).rejects.toThrow(/Таймаут запроса/);
  });

  it("свой таймаут запроса перебивает клиентский и попадает в текст ошибки", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          (init as RequestInit).signal?.addEventListener("abort", () =>
            reject(new DOMException("aborted", "AbortError")),
          );
        }),
    );
    const c = new BaseHttpClient({
      baseUrl: "https://api.example.com",
      maxRetries: 1,
      timeout: 60_000,
    });
    await expect(
      c.request({ method: "GET", path: "/slow", timeout: 25 }),
    ).rejects.toThrow(/\(0\.025с\)/);
  });
});

describe("BaseHttpClient — 401 обновляет токен и повторяет", () => {
  /** Стратегия, считающая вызовы invalidate. */
  function refreshingAuth() {
    const calls = { invalidate: 0, authenticate: 0 };
    return {
      calls,
      strategy: {
        type: "test",
        async authenticate(req: RequestInit) {
          calls.authenticate++;
          return req;
        },
        invalidate() {
          calls.invalidate++;
        },
      },
    };
  }

  it("401 → invalidate() и повтор, без паузы бэкоффа", async () => {
    const delays = captureBackoff();
    const { calls, strategy } = refreshingAuth();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(status(401))
      .mockResolvedValueOnce(ok());

    const c = new BaseHttpClient({
      baseUrl: "https://api.example.com",
      maxRetries: 3,
      timeout: ABORT_MS,
      auth: strategy,
    });
    await expect(c.request({ method: "GET", path: "/x" })).resolves.toEqual({ ok: true });

    expect(calls.invalidate).toBe(1);
    expect(calls.authenticate).toBe(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(delays).toEqual([]);
  });

  it("403 идёт по той же ветке обновления токена", async () => {
    captureBackoff();
    const { calls, strategy } = refreshingAuth();
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(status(403))
      .mockResolvedValueOnce(ok());

    const c = new BaseHttpClient({
      baseUrl: "https://api.example.com",
      maxRetries: 3,
      timeout: ABORT_MS,
      auth: strategy,
    });
    await expect(c.request({ method: "GET", path: "/x" })).resolves.toEqual({ ok: true });
    expect(calls.invalidate).toBe(1);
  });

  it("POST на 401 повторяется — запрос отбит до применения, дубля не будет", async () => {
    captureBackoff();
    const { strategy } = refreshingAuth();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(status(401))
      .mockResolvedValueOnce(ok());

    const c = new BaseHttpClient({
      baseUrl: "https://api.example.com",
      maxRetries: 3,
      timeout: ABORT_MS,
      auth: strategy,
    });
    await expect(c.request({ method: "POST", path: "/doc", body: { a: 1 } })).resolves.toEqual({
      ok: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("стратегия без invalidate (Basic, API-key) не крутит 401 по кругу", async () => {
    captureBackoff();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async () => status(401));
    const c = new BaseHttpClient({
      baseUrl: "https://api.example.com",
      maxRetries: 3,
      timeout: ABORT_MS,
      auth: { type: "basic", authenticate: async (r: RequestInit) => r },
    });

    await expect(c.request({ method: "GET", path: "/x" })).rejects.toThrow(/HTTP 401/);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("бесконечный 401 упирается в maxRetries и отдаёт последний ответ как ошибку", async () => {
    captureBackoff();
    const { calls, strategy } = refreshingAuth();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async () => status(401));
    const c = new BaseHttpClient({
      baseUrl: "https://api.example.com",
      maxRetries: 3,
      timeout: ABORT_MS,
      auth: strategy,
    });

    await expect(c.request({ method: "GET", path: "/x" })).rejects.toThrow(/HTTP 401/);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(calls.invalidate).toBe(2); // на последней попытке уже не обновляем
  });
});

describe("BaseHttpClient — разбор успешного ответа", () => {
  it("пустое тело → null, а не падение JSON.parse", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    await expect(client().request({ method: "DELETE", path: "/x" })).resolves.toBeNull();
  });

  it("не-JSON тело возвращается текстом (XML у ЦБ, CSV у выгрузок)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("<ValCurs><Valute/></ValCurs>", { status: 200 }),
    );
    await expect(client().request({ method: "GET", path: "/x" })).resolves.toBe(
      "<ValCurs><Valute/></ValCurs>",
    );
  });

  it("query-параметры уезжают в URL, а не в тело", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async () => ok());
    await client().request({ method: "GET", path: "/x", params: { a: "1", b: "два" } });
    expect(fetchMock.mock.calls[0]![0]).toBe("https://api.example.com/x?a=1&b=%D0%B4%D0%B2%D0%B0");
  });

  it("заголовки ответа складываются в ApiError — на них живёт retry-after", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("nope", { status: 429, headers: { "Retry-After": "30", "X-Trace": "abc" } }),
    );
    const err = (await client()
      .request({ method: "POST", path: "/x" })
      .catch((e) => e)) as ApiError;

    expect(err.headers?.["retry-after"]).toBe("30");
    expect(err.headers?.["x-trace"]).toBe("abc");
  });
});

describe("RateLimitedClient — лимитер стоит перед запросом", () => {
  it("выдаёт первые bucketMax запросов без ожидания", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async () => ok());
    const c = new RateLimitedClient({
      baseUrl: "https://api.example.com",
      maxRetries: 1,
      timeout: ABORT_MS,
      bucketMax: 3,
      bucketRefillMs: 60_000,
    });

    const started = Date.now();
    await Promise.all([
      c.request({ method: "GET", path: "/1" }),
      c.request({ method: "GET", path: "/2" }),
      c.request({ method: "GET", path: "/3" }),
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(Date.now() - started).toBeLessThan(1000);
  });
});
