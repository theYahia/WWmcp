/**
 * Признак незавершённой выдачи (has_more) у читающих инструментов.
 *
 * Смысл: продаётся тезис «самоделка на OData не падает — она молча врёт».
 * Без has_more сервер делал ровно то же: на базе с 12 000 документов отдавал
 * первые 100 и модель считала по ним сумму. Проверяется не одна ручка, а все
 * читающие сразу — правка в одном месте оставила бы остальные молчаливо врущими.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleGetCatalogs } from "../src/tools/catalogs.js";
import { handleGetDocuments } from "../src/tools/documents.js";
import { handleGetRegister } from "../src/tools/registers.js";
import { handleGetAccountingRegister } from "../src/tools/accounting.js";
import { handleODataQuery } from "../src/tools/odata-query.js";
import { handleFindByDescription, handleGetRecentDocuments } from "../src/tools/shortcuts.js";
import { handleBatchQuery } from "../src/tools/batch.js";
import { resetClient } from "../src/client.js";

interface Envelope {
  value: unknown[];
  returned: number;
  has_more: boolean;
  next_skip?: number;
}

function rows(n: number): Array<{ Ref_Key: string }> {
  return Array.from({ length: n }, (_, i) => ({ Ref_Key: `r${i}` }));
}

function mockRows(n: number, extra: Record<string, unknown> = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(JSON.stringify({ value: rows(n), ...extra })),
    headers: new Map(),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** Инструменты с параметром skip — у них есть куда подставить next_skip. */
const PAGED = [
  ["get_documents", (top: number) => handleGetDocuments({ document_type: "Document_Test", top, skip: 0 })],
  ["get_catalogs", (top: number) => handleGetCatalogs({ catalog_name: "Номенклатура", top, skip: 0 })],
  ["get_register", (top: number) =>
    handleGetRegister({ register_type: "AccumulationRegister", register_name: "ТоварыНаСкладах", top, skip: 0 })],
  ["get_accounting_register", (top: number) =>
    handleGetAccountingRegister({ register_name: "Хозрасчетный", top, skip: 0 })],
  ["odata_query", (top: number) =>
    handleODataQuery({ entity: "Catalog_Test", top, skip: 0, inlinecount: false })],
] as const;

/** Инструменты без skip: has_more обязателен, next_skip был бы подсказкой в никуда. */
const UNPAGED = [
  ["find_by_description", (top: number) =>
    handleFindByDescription({ entity: "Catalog_Test", query: "Ромашка", top })],
  ["get_recent_documents", (top: number) =>
    handleGetRecentDocuments({ document_type: "Document_Test", top, posted_only: false })],
] as const;

describe("has_more — признак незавершённой выдачи", () => {
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

  for (const [name, call] of PAGED) {
    it(`${name}: 101 запись при top=100 → has_more, ровно 100 в ответе, next_skip=100`, async () => {
      mockRows(101);
      const parsed = JSON.parse(await call(100)) as Envelope;
      expect(parsed.value).toHaveLength(100);
      expect(parsed.returned).toBe(100);
      expect(parsed.has_more).toBe(true);
      expect(parsed.next_skip).toBe(100);
    });

    it(`${name}: 40 записей при top=100 → has_more=false, next_skip отсутствует`, async () => {
      mockRows(40);
      const parsed = JSON.parse(await call(100)) as Envelope;
      expect(parsed.value).toHaveLength(40);
      expect(parsed.returned).toBe(40);
      expect(parsed.has_more).toBe(false);
      expect(parsed).not.toHaveProperty("next_skip");
    });

    it(`${name}: в 1С уходит $top=top+1`, async () => {
      const fetchMock = mockRows(1);
      await call(100);
      expect(String(fetchMock.mock.calls[0][0])).toContain("$top=101");
    });
  }

  for (const [name, call] of UNPAGED) {
    it(`${name}: has_more есть, next_skip нет (в схеме нет skip)`, async () => {
      mockRows(21);
      const parsed = JSON.parse(await call(20)) as Envelope;
      expect(parsed.value).toHaveLength(20);
      expect(parsed.returned).toBe(20);
      expect(parsed.has_more).toBe(true);
      expect(parsed).not.toHaveProperty("next_skip");
    });
  }

  it("ровно top записей — выдача полная, has_more=false", async () => {
    mockRows(100);
    const parsed = JSON.parse(
      await handleGetDocuments({ document_type: "Document_Test", top: 100, skip: 0 }),
    ) as Envelope;
    expect(parsed.returned).toBe(100);
    expect(parsed.has_more).toBe(false);
  });

  it("next_skip продолжает от переданного skip", async () => {
    mockRows(101);
    const parsed = JSON.parse(
      await handleGetDocuments({ document_type: "Document_Test", top: 100, skip: 200 }),
    ) as Envelope;
    expect(parsed.next_skip).toBe(300);
  });

  it("прочие поля ответа не теряются (odata.count при $inlinecount)", async () => {
    mockRows(5, { "odata.count": "12000" });
    const parsed = JSON.parse(
      await handleODataQuery({ entity: "Catalog_Test", top: 100, skip: 0, inlinecount: true }),
    ) as Envelope & { "odata.count": string };
    expect(parsed["odata.count"]).toBe("12000");
    expect(parsed.has_more).toBe(false);
  });

  it("ответ не в форме {value:[...]} проходит как есть", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ Ref_Key: "abc", Description: "Молоко" })),
        headers: new Map(),
      }),
    );
    const parsed = JSON.parse(
      await handleODataQuery({ entity: "Catalog_Test", top: 100, skip: 0, inlinecount: false }),
    ) as Record<string, unknown>;
    expect(parsed["Description"]).toBe("Молоко");
    expect(parsed).not.toHaveProperty("has_more");
  });

  it("batch_query: конверт есть в данных каждого под-запроса", async () => {
    mockRows(101);
    const parsed = JSON.parse(
      await handleBatchQuery({
        queries: [{ entity: "Catalog_Test", top: 100, skip: 0 }],
        concurrency: 5,
      }),
    ) as { results: Array<{ data: Envelope }> };
    expect(parsed.results[0]!.data.has_more).toBe(true);
    expect(parsed.results[0]!.data.returned).toBe(100);
    expect(parsed.results[0]!.data.next_skip).toBe(100);
  });
});
