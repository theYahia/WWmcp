/**
 * Размер ответа: компактный JSON и обрезка по целым записям.
 *
 * При `top: 5000` (схема это разрешает) ответ переваливал лимит 50 000 символов в
 * `truncateResponse` ядра и приходил в модель обрезанным посреди записи —
 * синтаксически невалидным. Модель вынуждена додумывать. Здесь проверяется, что
 * инструмент режет раньше, по записям, и результат всегда парсится.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { handleGetDocuments } from "../src/tools/documents.js";
import { handleODataQuery } from "../src/tools/odata-query.js";
import { handleGetRegister } from "../src/tools/registers.js";
import { handleListEntities } from "../src/tools/metadata.js";
import { handlePollChangesSince } from "../src/tools/change-tracking.js";
import { resetClient } from "../src/client.js";

const TOOLS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "tools");

/** Лимит `truncateResponse` в @theyahia/mcp-core — за него выходить нельзя. */
const CORE_LIMIT = 50_000;

interface Capped {
  value?: unknown[];
  rows?: unknown[];
  entities?: unknown[];
  truncated?: number;
  note?: string;
}

function mockValue(rowCount: number) {
  // Запись достаточно жирная, чтобы 5000 штук гарантированно вышли за лимит.
  const value = Array.from({ length: rowCount }, (_, i) => ({
    Ref_Key: `0123456${String(i).padStart(4, "0")}-89ab-cdef-0123-456789abcdef`,
    Number: `РТУ-${i}`,
    Date: "2026-07-01T00:00:00",
    Description: "Реализация товаров и услуг покупателю по договору поставки",
    Posted: true,
  }));
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ value })),
      headers: new Map(),
    }),
  );
}

describe("компактный JSON без отступов", () => {
  it("ни один handler не содержит JSON.stringify(..., null, 2)", () => {
    const offenders: string[] = [];
    for (const file of readdirSync(TOOLS_DIR).filter((f) => f.endsWith(".ts"))) {
      const src = readFileSync(join(TOOLS_DIR, file), "utf8");
      // И однострочная форма `, null, 2)`, и многострочная `,\n null,\n 2,\n)`.
      if (/,\s*null,\s*2,?\s*\)/.test(src)) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });
});

describe("обрезка по записям, а не по символам", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["ONEC_BASE_URL"] = "http://localhost:8080/base";
    process.env["ONEC_LOGIN"] = "admin";
    process.env["ONEC_PASSWORD"] = "secret";
    resetClient();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    resetClient();
  });

  it("get_documents при 5000 записях: валидный JSON, truncated с числом отброшенных", async () => {
    mockValue(5000);
    const raw = await handleGetDocuments({ document_type: "Document_Test", top: 5000, skip: 0 });

    expect(() => JSON.parse(raw)).not.toThrow();
    expect(raw.length).toBeLessThanOrEqual(CORE_LIMIT);

    const parsed = JSON.parse(raw) as Capped;
    expect(parsed.truncated).toBeGreaterThan(0);
    expect(parsed.note).toContain("обрезан");
    // Отброшенные + оставшиеся = всё, что пришло из 1С.
    expect(parsed.value!.length + parsed.truncated!).toBe(5000);
    // Последняя запись целая, а не оборванная посередине.
    expect(parsed.value!.at(-1)).toHaveProperty("Posted", true);
  });

  it("odata_query при 5000 записях: то же самое", async () => {
    mockValue(5000);
    const raw = await handleODataQuery({
      entity: "Catalog_Test", top: 5000, skip: 0, inlinecount: false,
    });
    expect(() => JSON.parse(raw)).not.toThrow();
    expect((JSON.parse(raw) as Capped).truncated).toBeGreaterThan(0);
  });

  it("get_register при 5000 записях: то же самое", async () => {
    mockValue(5000);
    const raw = await handleGetRegister({
      register_type: "AccumulationRegister", register_name: "ТоварыНаСкладах", top: 5000, skip: 0,
    });
    expect(() => JSON.parse(raw)).not.toThrow();
    expect((JSON.parse(raw) as Capped).truncated).toBeGreaterThan(0);
  });

  it("poll_changes_since режет rows, а не символы", async () => {
    mockValue(5000);
    const raw = await handlePollChangesSince({
      entity: "Document_Test", since: "2026-05-19T00:00:00", date_field: "Date", top: 5000,
    });
    expect(() => JSON.parse(raw)).not.toThrow();
    const parsed = JSON.parse(raw) as Capped;
    expect(parsed.truncated).toBeGreaterThan(0);
    expect(parsed.rows!.at(-1)).toHaveProperty("Posted", true);
  });

  it("list_entities режет entities", async () => {
    const value = Array.from({ length: 20_000 }, (_, i) => ({
      name: `Catalog_ОченьДлинноеИмяСущностиДляРаздуванияОтвета${i}`,
      url: `Catalog_Test${i}`,
    }));
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ value })),
        headers: new Map(),
      }),
    );
    const raw = await handleListEntities({ type: "all" });
    expect(() => JSON.parse(raw)).not.toThrow();
    const parsed = JSON.parse(raw) as Capped;
    expect(parsed.truncated).toBeGreaterThan(0);
    expect(typeof parsed.entities!.at(-1)).toBe("string");
  });

  it("короткий ответ не получает truncated и note", async () => {
    mockValue(3);
    const parsed = JSON.parse(
      await handleGetDocuments({ document_type: "Document_Test", top: 100, skip: 0 }),
    ) as Capped;
    expect(parsed).not.toHaveProperty("truncated");
    expect(parsed).not.toHaveProperty("note");
    expect(parsed.value).toHaveLength(3);
  });

  it("ответ компактный: отступов в JSON нет", async () => {
    mockValue(3);
    const raw = await handleGetDocuments({ document_type: "Document_Test", top: 100, skip: 0 });
    expect(raw).not.toContain('\n  "');
    expect(raw).not.toContain("\n");
  });
});
