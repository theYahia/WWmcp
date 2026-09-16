/**
 * `createToolError` — разбор структурированной ошибки в текст для модели.
 *
 * Зачем отдельный файл: это последний участок пути от чужого API к контексту
 * модели, и он не был покрыт ничем. Каждая ветка здесь — отдельный совет модели,
 * что делать дальше («проверьте ID», «повторите через N секунд», «попросите
 * пользователя проверить права»). Ошибка в категоризации не падает и не логируется:
 * модель просто получает не тот совет и уходит не туда.
 *
 * Отдельно проверяется `withDetails` — дописывание исходного сообщения к канонной
 * фразе. Ветки auth / rate_limit / not_found / server_error классифицируют по
 * HTTP-статусу и раньше теряли всё, что сервер положил в `message`. Для серверов,
 * разбирающих тело ошибки внешнего API (aprovodka с русскими ошибками 1С), это
 * выбрасывало разбор целиком: `object_not_found` и `permission_denied` приходят
 * ровно на 404 и 403.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { z } from "zod";
import { createToolError } from "../src/errors.js";
import { ApiError, BaseHttpClient } from "../src/client.js";

/** Текст единственного блока результата. */
const textOf = (e: unknown): string =>
  (createToolError(e).content![0] as { text: string }).text;

describe("createToolError — категоризация", () => {
  it("ZodError → валидация, с именем поля и причиной", () => {
    let err: unknown;
    try {
      z.object({ amount: z.number() }).parse({ amount: "x" });
    } catch (e) {
      err = e;
    }
    const text = textOf(err);
    expect(createToolError(err).isError).toBe(true);
    expect(text).toContain("Ошибка валидации");
    expect(text).toContain("amount");
    expect(text).toContain("Исправьте параметры");
  });

  it("ZodError со вложенным путём склеивает путь через точку", () => {
    let err: unknown;
    try {
      z.object({ order: z.object({ id: z.string() }) }).parse({ order: { id: 7 } });
    } catch (e) {
      err = e;
    }
    expect(textOf(err)).toContain("order.id");
  });

  it("401 → отказ в доступе, совет про права, а не про «поменяйте ключ»", () => {
    const text = textOf(new ApiError(401, "HTTP 401: Unauthorized"));
    expect(text).toContain("Отказ в доступе (HTTP 401)");
    expect(text).toContain("права его учётной записи");
  });

  it("403 → та же ветка, но со своим статусом в тексте", () => {
    expect(textOf(new ApiError(403, "nope"))).toContain("Отказ в доступе (HTTP 403)");
  });

  it("429 → rate limit, пауза берётся из заголовка retry-after", () => {
    const text = textOf(
      new ApiError(429, "HTTP 429: Too Many Requests", "body", { "retry-after": "7" }),
    );
    expect(text).toContain("Повторите через 7с");
  });

  it("429 без retry-after → запасные 60 секунд, а не пустое место", () => {
    expect(textOf(new ApiError(429, "HTTP 429"))).toContain("Повторите через 60с");
  });

  it("404 → не найдено, с советом сходить в search/list", () => {
    const text = textOf(new ApiError(404, "нет такого"));
    expect(text).toContain("Ресурс не найден");
    expect(text).toContain("search/list");
  });

  it("500 → ошибка сервера с предложением повторить", () => {
    expect(textOf(new ApiError(500, "HTTP 500"))).toContain("Ошибка сервера (HTTP 500)");
  });

  it("503 попадает в ту же ветку 5xx", () => {
    expect(textOf(new ApiError(503, "HTTP 503"))).toContain("Ошибка сервера (HTTP 503)");
  });

  it("голый AbortError → таймаут", () => {
    const text = textOf(new DOMException("aborted", "AbortError"));
    expect(text).toContain("Таймаут запроса");
    expect(text).toContain("не ответил вовремя");
  });

  it("обычный Error → общая ветка, сообщение сохраняется", () => {
    expect(textOf(new Error("boom"))).toContain("boom");
  });

  it("брошена не-ошибка (строка) → «Неизвестная ошибка», а не undefined в контексте", () => {
    const text = textOf("just a string");
    expect(text).toContain("Неизвестная ошибка");
    expect(text).not.toContain("undefined");
  });

  it("любая ветка помечает результат isError: true — иначе модель примет отказ за данные", () => {
    for (const e of [
      new ApiError(401, "a"),
      new ApiError(429, "b"),
      new ApiError(404, "c"),
      new ApiError(500, "d"),
      new DOMException("x", "AbortError"),
      new Error("e"),
      "f",
    ]) {
      expect(createToolError(e).isError).toBe(true);
    }
  });
});

describe("createToolError — withDetails дописывает разбор внешнего API", () => {
  it("404: сообщение сервера доезжает до модели после канонной фразы", () => {
    const text = textOf(new ApiError(404, "object_not_found: справочник Контрагенты"));
    expect(text).toContain("Детали: object_not_found: справочник Контрагенты");
  });

  it("403: разбор 1С (permission_denied) не теряется на ветке по статусу", () => {
    expect(textOf(new ApiError(403, "permission_denied: нет роли"))).toContain(
      "Детали: permission_denied: нет роли",
    );
  });

  it("500 и 429 тоже несут детали", () => {
    expect(textOf(new ApiError(500, "session_locked"))).toContain("Детали: session_locked");
    expect(textOf(new ApiError(429, "quota exhausted"))).toContain("Детали: quota exhausted");
  });

  it("не дублирует текст, который уже есть в канонной фразе", () => {
    // Сообщение целиком входит в канонную фразу ветки → второй раз не приписывается.
    const text = textOf(new ApiError(404, "Ресурс не найден"));
    expect(text).not.toContain("Детали:");
  });

  it("пустое сообщение не превращается в висящее «Детали:»", () => {
    const text = textOf(new ApiError(404, "   "));
    expect(text).not.toContain("Детали:");
  });
});

/**
 * Известный шов: BaseHttpClient не выпускает наружу голый AbortError — он
 * переупаковывает таймаут в `ApiError(0, ...)`. Статус 0 не попадает ни в одну
 * ветку по статусу, поэтому клиентский таймаут разбирается ОБЩЕЙ веткой, а не
 * `timeout`. Совет модели при этом не теряется — он лежит в самом сообщении.
 * Тест фиксирует именно это, чтобы правка категоризации не съела текст молча.
 */
describe("createToolError — таймаут клиента приходит как ApiError(0)", () => {
  it("текст про таймаут доезжает до модели, хотя ветка общая", () => {
    const text = textOf(new ApiError(0, "Таймаут запроса (15с). API не ответил вовремя."));
    expect(text).toContain("Таймаут запроса (15с)");
    expect(text).toContain("не ответил вовремя");
  });

  it("предупреждение «проверьте базу» с мутации не срезается по дороге", () => {
    const text = textOf(
      new ApiError(0, "Таймаут запроса (15с).\nПроверьте в базе, не создан ли объект."),
    );
    expect(text).toContain("не создан ли объект");
  });
});

/**
 * Сквозная цепочка: 429 от API → BaseHttpClient складывает заголовки ответа в
 * ApiError → createToolError читает из них retry-after. Оба звена были покрыты
 * по отдельности только на словах; ломается она молча — модель получит «через
 * 60с» вместо реальной паузы и упрётся в лимит второй раз.
 */
describe("сквозь клиент: заголовки ответа доезжают до совета модели", () => {
  afterEach(() => vi.restoreAllMocks());

  it("retry-after из живого Response доходит до текста ошибки", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("slow down", { status: 429, headers: { "Retry-After": "12" } }),
    );
    // POST: мутацию клиент не повторяет, ошибка приходит с первой попытки.
    const client = new BaseHttpClient({ baseUrl: "https://api.example.com", maxRetries: 3 });
    const err = await client.request({ method: "POST", path: "/pay" }).catch((e) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(429);
    expect(textOf(err)).toContain("Повторите через 12с");
  });

  it("тело ответа 4xx кладётся в ApiError.body, но не подмешивается в совет модели", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response('{"error":"bad_request"}', { status: 400 }),
    );
    const client = new BaseHttpClient({ baseUrl: "https://api.example.com" });
    const err = (await client
      .request({ method: "POST", path: "/pay" })
      .catch((e) => e)) as ApiError;

    expect(err.body).toBe('{"error":"bad_request"}');
    // 400 не попадает ни в одну ветку по статусу → общая ветка с message, без тела.
    expect(textOf(err)).toContain("HTTP 400");
    expect(textOf(err)).not.toContain("bad_request");
  });
});
