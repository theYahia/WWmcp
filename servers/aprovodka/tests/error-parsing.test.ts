import { describe, it, expect } from "vitest";
import {
  parseOneCError,
  formatOneCErrorHint,
  enrichOneCError,
} from "../src/lib/errors.js";
import { ApiError, createToolError } from "@theyahia/mcp-core";

describe("parseOneCError", () => {
  it("returns null on empty body", () => {
    expect(parseOneCError("")).toBeNull();
  });

  it("recognises object-not-found from JSON odata.error envelope", () => {
    const body = '{"odata.error":{"code":"-1","message":{"value":"Объект не найден по ссылке"}}}';
    const r = parseOneCError(body);
    expect(r).not.toBeNull();
    expect(r!.category).toBe("object_not_found");
    expect(r!.raw_message).toContain("Объект не найден");
    expect(r!.suggestion).toMatch(/Ref_Key|list_entities/);
  });

  it("recognises required-field error from JSON envelope", () => {
    const body = '{"odata.error":{"code":"-1","message":{"value":"Поле Контрагент не заполнено"}}}';
    const r = parseOneCError(body)!;
    expect(r.category).toBe("field_required");
    expect(r.suggestion).toMatch(/обязательн|реквизит/i);
  });

  it("recognises type-mismatch", () => {
    const body = '{"odata.error":{"message":{"value":"несоответствие типов для поля Date"}}}';
    const r = parseOneCError(body)!;
    expect(r.category).toBe("type_mismatch");
  });

  it("recognises permission-denied", () => {
    const body = '{"odata.error":{"message":{"value":"Нарушение прав доступа к объекту"}}}';
    const r = parseOneCError(body)!;
    expect(r.category).toBe("permission_denied");
    expect(r.suggestion).toMatch(/администратор|рол/i);
  });

  it("recognises posting-failed", () => {
    const body = '{"odata.error":{"message":{"value":"Документ не может быть проведен"}}}';
    const r = parseOneCError(body)!;
    expect(r.category).toBe("posting_failed");
  });

  it("recognises deletion-locked", () => {
    const body = '{"odata.error":{"message":{"value":"Установлена пометка удаления — удаление запрещено"}}}';
    const r = parseOneCError(body)!;
    expect(r.category).toBe("deletion_locked");
    expect(r.suggestion).toMatch(/DeletionMark/);
  });

  it("recognises invalid GUID", () => {
    const body = '{"odata.error":{"message":{"value":"Неверный формат GUID"}}}';
    const r = parseOneCError(body)!;
    expect(r.category).toBe("invalid_guid");
  });

  it("recognises session-locked", () => {
    const body = '{"odata.error":{"message":{"value":"сеанс заблокирован"}}}';
    const r = parseOneCError(body)!;
    expect(r.category).toBe("session_locked");
  });

  it("extracts message from XML Atom envelope", () => {
    const body = '<?xml version="1.0"?><error><code>-1</code><message xml:lang="ru">Объект не найден</message></error>';
    const r = parseOneCError(body)!;
    expect(r.category).toBe("object_not_found");
    expect(r.raw_message).toBe("Объект не найден");
  });

  it("falls back to unknown category but preserves raw message", () => {
    const body = '{"odata.error":{"message":{"value":"Какая-то непонятная ошибка 1С"}}}';
    const r = parseOneCError(body)!;
    expect(r.category).toBe("unknown");
    expect(r.raw_message).toContain("непонятная");
  });

  it("returns null when body has no extractable message and no patterns", () => {
    expect(parseOneCError("xxx".repeat(500))).toBeNull();
  });
});

describe("formatOneCErrorHint", () => {
  it("produces single-line summary with category, raw text, and suggestion", () => {
    const r = parseOneCError(
      '{"odata.error":{"message":{"value":"Объект не найден"}}}',
    )!;
    const line = formatOneCErrorHint(r);
    expect(line).toMatch(/^\[1C object_not_found\]/);
    expect(line).toContain("Объект не найден");
    expect(line).toContain("Подсказка:");
  });
});

describe("enrichOneCError", () => {
  it("enriches an ApiError with 1C hint when body is recognisable", () => {
    const err = new ApiError(
      400,
      "HTTP 400: Bad Request",
      '{"odata.error":{"message":{"value":"Поле Контрагент не заполнено"}}}',
    );
    const enriched = enrichOneCError(err) as ApiError;
    expect(enriched.message).toMatch(/HTTP 400/); // original preserved
    expect(enriched.message).toMatch(/field_required|Поле/);
    expect(enriched.status).toBe(400); // status preserved
  });

  it("leaves non-ApiError untouched", () => {
    const e = new Error("random");
    const r = enrichOneCError(e);
    expect(r).toBe(e);
  });

  it("leaves ApiError with empty body untouched", () => {
    const err = new ApiError(500, "HTTP 500", "");
    const before = err.message;
    enrichOneCError(err);
    expect(err.message).toBe(before);
  });
});

/**
 * Разбор ошибок 1С нужен только затем, чтобы подсказка дошла до модели.
 * `createToolError` в ядре классифицирует по HTTP-статусу и до WORK-1514
 * на 401/403/404/429/5xx возвращал только свою фиксированную фразу —
 * то есть три из десяти шаблонов (`object_not_found`, `permission_denied`,
 * `session_locked`) не доходили до LLM физически никогда.
 */
describe("подсказки 1С доходят до модели через createToolError", () => {
  function textOf(error: unknown): string {
    const result = createToolError(error);
    expect(result.isError).toBe(true);
    return (result.content as Array<{ type: string; text: string }>)
      .map((b) => b.text)
      .join("\n");
  }

  it("404 с телом ошибки 1С — в ответе видна подсказка object_not_found", () => {
    const err = enrichOneCError(
      new ApiError(
        404,
        "HTTP 404: Not Found",
        '{"odata.error":{"message":{"value":"Объект не найден по ссылке"}}}',
      ),
    );
    const text = textOf(err);
    expect(text).toContain("object_not_found");
    expect(text).toContain("Объект не найден");
    expect(text).toMatch(/list_entities/);
  });

  it("403 — подсказка permission_denied, слова «API-ключ» нет", () => {
    const err = enrichOneCError(
      new ApiError(
        403,
        "HTTP 403: Forbidden",
        '{"odata.error":{"message":{"value":"Нарушение прав доступа"}}}',
      ),
    );
    const text = textOf(err);
    expect(text).toContain("permission_denied");
    expect(text).toContain("Нарушение прав доступа");
    expect(text).not.toMatch(/API-ключ/);
  });

  it("429 и 500 тоже несут исходное сообщение", () => {
    expect(textOf(new ApiError(429, "HTTP 429 | лимит сеансов 1С"))).toContain(
      "лимит сеансов 1С",
    );
    expect(textOf(new ApiError(503, "HTTP 503 | база на обслуживании"))).toContain(
      "база на обслуживании",
    );
  });

  it("ошибка без сообщения не дописывает пустой хвост «Детали:»", () => {
    expect(textOf(new ApiError(404, ""))).not.toContain("Детали:");
  });
});

describe("session_locked не присваивает себе блокировку объекта", () => {
  it("блокировка базы — session_locked", () => {
    const body = '{"odata.error":{"message":{"value":"Блокировка информационной базы"}}}';
    expect(parseOneCError(body)!.category).toBe("session_locked");
  });

  it("блокировка объекта другим пользователем — не session_locked", () => {
    const body =
      '{"odata.error":{"message":{"value":"Блокировка объекта другим пользователем"}}}';
    const r = parseOneCError(body)!;
    expect(r.category).toBe("unknown");
    // Исходный русский текст всё равно доходит до модели.
    expect(r.raw_message).toContain("Блокировка объекта");
  });
});
