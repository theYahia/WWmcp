import { describe, it, expect } from "vitest";
import {
  parseOneCError,
  formatOneCErrorHint,
  enrichOneCError,
} from "../src/lib/errors.js";
import { ApiError } from "@theyahia/mcp-core";

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
    expect(r.suggestion).toMatch(/mandatory|required/i);
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
    expect(r.suggestion).toMatch(/administrator|role/i);
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
    expect(line).toContain("Suggestion:");
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
