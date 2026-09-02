import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  handleGetCatalogs,
  handleCreateCatalogItem,
  handleUpdateCatalogItem,
} from "../src/tools/catalogs.js";
import {
  handleGetDocuments,
  handleCreateDocument,
  handleUpdateDocument,
  handlePostDocument,
  handleUnpostDocument,
  handleDeleteDocument,
  handleGetDocumentLines,
} from "../src/tools/documents.js";
import {
  handleGetRegister,
  handleWriteInformationRegister,
  handleGetAccumulationBalance,
} from "../src/tools/registers.js";
import { handleGetReport } from "../src/tools/reports.js";
import { handleODataQuery } from "../src/tools/odata-query.js";
import {
  handleListEntities,
  handleGetDocumentByNumber,
  handleGetMetadata,
  handleDescribeEntity,
} from "../src/tools/metadata.js";
import {
  handleFindByDescription,
  handleGetByKey,
  handleCountEntities,
  handleSetDeletionMark,
  handleGetRecentDocuments,
} from "../src/tools/shortcuts.js";
import { handleGetConstant, handleSetConstant } from "../src/tools/constants.js";
import { handleGetAccountingRegister, handleGetAccountingBalance } from "../src/tools/accounting.js";
import { refKeySchema, odataDate } from "../src/validation.js";
import { resetClient } from "../src/client.js";

function mockFetchOk(data: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(data)),
      headers: new Map(),
    }),
  );
}

describe("tool handlers", () => {
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

  it("handleGetCatalogs returns JSON string", async () => {
    mockFetchOk({ value: [{ Ref_Key: "abc", Description: "Молоко" }] });
    const result = await handleGetCatalogs({
      catalog_name: "Catalog_Номенклатура",
      top: 10,
      skip: 0,
    });
    expect(result).toContain("Молоко");
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it("handleGetDocuments builds OData filter", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ value: [] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await handleGetDocuments({
      document_type: "Document_РеализацияТоваровУслуг",
      filter: "Date ge datetime'2026-01-01T00:00:00'",
      top: 100,
      skip: 0,
    });
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("Document_%D0%A0%D0%B5%D0%B0%D0%BB%D0%B8%D0%B7%D0%B0%D1%86%D0%B8%D1%8F");
    expect(url).toContain("$filter=");
    // top+1: лишняя запись — признак незавершённой выдачи, в ответ она не попадает
    expect(url).toContain("$top=101");
  });

  it("handleCreateDocument sends POST with body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ Ref_Key: "new-uuid" })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handleCreateDocument({
      document_type: "Document_Test",
      data: { Number: "001", Date: "2026-04-22" },
    });
    expect(result).toContain("new-uuid");
    const [, opts] = fetchMock.mock.calls[0];
    expect(opts.method).toBe("POST");
  });

  it("handleUpdateDocument sends PATCH to GUID URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ Ref_Key: "abc" })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await handleUpdateDocument({
      document_type: "Document_Test",
      ref_key: "5c8d9e2f-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
      data: { Posted: true },
    });
    const [url, opts] = fetchMock.mock.calls[0];
    expect(opts.method).toBe("PATCH");
    expect(url).toContain("guid");
  });

  it("handleGetRegister composes register entity name", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ value: [] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await handleGetRegister({
      register_type: "InformationRegister",
      register_name: "ЦеныНоменклатуры",
      top: 100,
      skip: 0,
    });
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("InformationRegister_");
  });

  it("handleGetReport passes an allowed /hs/ path through", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ balance: 100 })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handleGetReport({ report_url: "/hs/reports/balance" });
    expect(result).toContain("balance");
  });

  // get_report — единственный инструмент со свободным путём: без белого списка модель
  // дотягивается под учётной записью сервера до /e1cib/ и служебных точек публикации.
  it.each([
    ["/e1cib/data/Catalog.Контрагенты", /белый список|e1cib/],
    ["/odata/standard.odata/../../e1cib/data", /переход вверх/],
    ["/hs/svc/%2e%2e/%2e%2e/e1cib", /переход вверх/],
    ["http://evil.example.com/steal", /абсолютный URL/],
    ["//evil.example.com/steal", /protocol-relative/],
    ["hs/reports/balance", /должен начинаться с/],
    ["/DefaultVSSetting", /белый список/],
  ])("handleGetReport refuses %s", async (url, expected) => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(handleGetReport({ report_url: url })).rejects.toThrow(expected);
    // Отказ до сети: запрос под нашими кредами вообще не уходит.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("handleGetReport still allows the OData publication path with a query", async () => {
    mockFetchOk({ value: [] });
    await expect(
      handleGetReport({ report_url: "/odata/standard.odata/Report_Продажи?$format=json" }),
    ).resolves.toContain("value");
  });

  it("handleODataQuery passes through filter+expand", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ value: [] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await handleODataQuery({
      entity: "Catalog_Test",
      filter: "Description eq 'X'",
      expand: "Owner",
      top: 100,
      skip: 0,
      inlinecount: true,
    });
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("$filter=");
    expect(url).toContain("$expand=Owner");
    expect(url).toContain("$inlinecount=allpages");
  });

  it("handleListEntities filters by type", async () => {
    mockFetchOk({
      value: [
        { name: "Catalog_Foo", url: "Catalog_Foo" },
        { name: "Document_Bar", url: "Document_Bar" },
        { name: "AccumulationRegister_Baz", url: "AccumulationRegister_Baz" },
      ],
    });

    const result = await handleListEntities({ type: "documents" });
    const parsed = JSON.parse(result) as { total: number; entities: string[] };
    expect(parsed.total).toBe(1);
    expect(parsed.entities).toEqual(["Document_Bar"]);
  });

  it("handleGetDocumentByNumber builds OData filter on Number", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ value: [{ Number: "ТД-00123" }] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await handleGetDocumentByNumber({
      document_type: "Document_РеализацияТоваровУслуг",
      number: "ТД-00123",
    });
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("Number");
    expect(url).toContain("00123");
  });

  it("handlePostDocument calls the Post() bound action via POST", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ Ref_Key: "abc", Posted: true })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await handlePostDocument({
      document_type: "Document_Test",
      ref_key: "5c8d9e2f-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
      operational: false,
    });
    const [url, opts] = fetchMock.mock.calls[0];
    expect(opts.method).toBe("POST");
    expect(url).toContain("guid'5c8d9e2f-1a2b-3c4d-5e6f-7a8b9c0d1e2f'");
    expect(url).toContain("/Post");
    expect(url).toContain("PostingModeOperational=false");
  });

  it("handleDeleteDocument issues DELETE on the keyed URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(""),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handleDeleteDocument({ document_type: "Document_Test", ref_key: "5c8d9e2f-1a2b-3c4d-5e6f-7a8b9c0d1e2f" });
    const [url, opts] = fetchMock.mock.calls[0];
    expect(opts.method).toBe("DELETE");
    expect(url).toContain("guid'5c8d9e2f-1a2b-3c4d-5e6f-7a8b9c0d1e2f'");
    expect(JSON.parse(result).deleted).toBe(true);
  });

  it("handleGetDocumentLines expands the tabular section by GUID", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ Ref_Key: "5c8d9e2f-1a2b-3c4d-5e6f-7a8b9c0d1e2f", Товары: [{ Номенклатура: "x" }] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);
    await handleGetDocumentLines({
      document_type: "Document_РеализацияТоваровУслуг",
      ref_key: "5c8d9e2f-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
      tabular_section: "Товары",
    });
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("guid'5c8d9e2f-1a2b-3c4d-5e6f-7a8b9c0d1e2f'");
    expect(decodeURIComponent(url)).toContain("$expand=Товары");
  });

  it("handleGetAccumulationBalance hits the Balance virtual method", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ value: [{ КоличествоBalance: 5 }] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await handleGetAccumulationBalance({
      register_name: "ОстаткиТоваровНаСкладах",
      period: "2026-06-01T00:00:00",
    });
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("AccumulationRegister_");
    expect(url).toContain("/Balance(");
    expect(url).toContain("Period=datetime");
  });

  it("handleCountEntities extracts odata.count via $inlinecount", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ value: [], "odata.count": "42" })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handleCountEntities({ entity: "Document_Test" });
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("$inlinecount=allpages");
    expect(url).toContain("$top=0");
    expect(JSON.parse(result).count).toBe("42");
  });

  it("handleSetDeletionMark PATCHes DeletionMark", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ Ref_Key: "abc", DeletionMark: true })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await handleSetDeletionMark({ entity: "Catalog_Номенклатура", ref_key: "5c8d9e2f-1a2b-3c4d-5e6f-7a8b9c0d1e2f", mark: true });
    const [url, opts] = fetchMock.mock.calls[0];
    expect(opts.method).toBe("PATCH");
    expect(url).toContain("guid'5c8d9e2f-1a2b-3c4d-5e6f-7a8b9c0d1e2f'");
    expect(JSON.parse(opts.body).DeletionMark).toBe(true);
  });

  it("handleFindByDescription uses substringof filter", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ value: [] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await handleFindByDescription({ entity: "Catalog_Контрагенты", query: "ООО Ромашка", top: 20 });
    const [url] = fetchMock.mock.calls[0];
    expect(decodeURIComponent(url)).toContain("substringof('ООО Ромашка',Description)");
  });

  it("handleGetMetadata returns raw EDMX/XML as text", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<edmx:Edmx Version=\"1.0\"></edmx:Edmx>"),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handleGetMetadata({});
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("$metadata");
    expect(result).toContain("edmx:Edmx");
  });

  it("handleDescribeEntity infers fields from a sample record", async () => {
    mockFetchOk({ value: [{ Ref_Key: "x", Description: "Y", Code: "001" }] });
    const result = await handleDescribeEntity({ entity: "Catalog_Номенклатура" });
    const parsed = JSON.parse(result) as { field_count: number; fields: Array<{ name: string }> };
    expect(parsed.field_count).toBe(3);
    expect(parsed.fields.map((f) => f.name)).toContain("Description");
  });

  // ── security: $filter injection escaping ──
  it("handleGetDocumentByNumber escapes a single quote in number", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ value: [] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await handleGetDocumentByNumber({ document_type: "Document_Test", number: "O'Brien" });
    const [url] = fetchMock.mock.calls[0];
    expect(decodeURIComponent(url)).toContain("Number eq 'O''Brien'");
  });

  // ── previously-untested handlers ──
  it("handleCreateCatalogItem POSTs a new item", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ Ref_Key: "new" })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = await handleCreateCatalogItem({
      catalog_name: "Catalog_Номенклатура",
      data: { Description: "Молоко" },
    });
    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
    expect(result).toContain("new");
  });

  it("handleUpdateCatalogItem PATCHes the keyed URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ Ref_Key: "x" })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);
    await handleUpdateCatalogItem({
      catalog_name: "Catalog_Номенклатура",
      ref_key: "5c8d9e2f-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
      data: { Description: "Кефир" },
    });
    const [url, opts] = fetchMock.mock.calls[0];
    expect(opts.method).toBe("PATCH");
    expect(url).toContain("guid'5c8d9e2f-1a2b-3c4d-5e6f-7a8b9c0d1e2f'");
  });

  it("handleUnpostDocument calls the Unpost() bound action", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ Posted: false })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);
    await handleUnpostDocument({
      document_type: "Document_Test",
      ref_key: "5c8d9e2f-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
    });
    const [url, opts] = fetchMock.mock.calls[0];
    expect(opts.method).toBe("POST");
    expect(url).toContain("/Unpost");
  });

  it("handleWriteInformationRegister POSTs to InformationRegister_*", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({})),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);
    await handleWriteInformationRegister({
      register_name: "ЦеныНоменклатуры",
      data: { Period: "2026-01-01T00:00:00", Цена: 100 },
    });
    const [url, opts] = fetchMock.mock.calls[0];
    expect(opts.method).toBe("POST");
    expect(url).toContain("InformationRegister_");
  });

  it("handleGetConstant normalises a bare constant name to Constant_*", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ Value: "RUB" })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = await handleGetConstant({ constant_name: "ОсновнаяВалюта" });
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain(encodeURIComponent("Constant_ОсновнаяВалюта"));
    expect(result).toContain("RUB");
  });

  it("handleSetConstant PATCHes the Value field", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ Value: "USD" })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);
    await handleSetConstant({ constant_name: "Constant_ОсновнаяВалюта", value: "USD" });
    const [, opts] = fetchMock.mock.calls[0];
    expect(opts.method).toBe("PATCH");
    expect(JSON.parse(opts.body).Value).toBe("USD");
  });

  it("handleGetAccountingRegister reads AccountingRegister_* (default Хозрасчетный)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ value: [] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);
    await handleGetAccountingRegister({ register_name: "Хозрасчетный", top: 100, skip: 0 });
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain(encodeURIComponent("AccountingRegister_Хозрасчетный"));
  });

  it("handleGetByKey GETs a single record by GUID", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ Ref_Key: "5c8d9e2f-1a2b-3c4d-5e6f-7a8b9c0d1e2f" })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);
    await handleGetByKey({
      entity: "Catalog_Номенклатура",
      ref_key: "5c8d9e2f-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
    });
    const [url, opts] = fetchMock.mock.calls[0];
    expect(opts.method).toBe("GET");
    expect(url).toContain("guid'5c8d9e2f-1a2b-3c4d-5e6f-7a8b9c0d1e2f'");
  });

  it("handleGetRecentDocuments orders by Date desc and can filter posted only", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ value: [] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);
    await handleGetRecentDocuments({ document_type: "Document_Test", top: 5, posted_only: true });
    const [url] = fetchMock.mock.calls[0];
    expect(decodeURIComponent(url)).toContain("$orderby=Date desc");
    expect(decodeURIComponent(url)).toContain("Posted eq true");
  });

  // ── schema-level validation ──
  it("refKeySchema rejects a non-GUID and accepts a GUID", () => {
    expect(refKeySchema.safeParse("abc-123").success).toBe(false);
    expect(refKeySchema.safeParse("5c8d9e2f-1a2b-3c4d-5e6f-7a8b9c0d1e2f").success).toBe(true);
  });

  it("odataDate rejects a non-date shape, accepts YYYY-MM-DD", () => {
    expect(odataDate.safeParse("not-a-date").success).toBe(false);
    expect(odataDate.safeParse("2026-01-01").success).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────
// Виртуальные таблицы регистра бухгалтерии + симметрия аргументов
// ──────────────────────────────────────────────────────────────

describe("accounting virtual tables", () => {
  const okJson = (body: unknown) => ({
    ok: true,
    text: () => Promise.resolve(JSON.stringify(body)),
    headers: new Map(),
  });

  beforeEach(() => {
    process.env["ONEC_BASE_URL"] = "http://1c.test/base";
    process.env["ONEC_LOGIN"] = "u";
    process.env["ONEC_PASSWORD"] = "p";
    resetClient();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("handleGetAccountingBalance builds Balance(Period=…) on AccountingRegister_*", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({ value: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await handleGetAccountingBalance({
      register_name: "Хозрасчетный",
      table: "Balance",
      period: "2026-06-01T00:00:00",
    });
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("AccountingRegister_");
    expect(url).toContain("/Balance(");
    expect(url).toContain("Period=datetime'2026-06-01T00:00:00'");
  });

  it("handleGetAccountingBalance passes a period range to Turnovers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({ value: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await handleGetAccountingBalance({
      register_name: "AccountingRegister_Хозрасчетный", // полная форма тоже принимается
      table: "Turnovers",
      start_period: "2026-01-01T00:00:00",
      end_period: "2026-06-30T23:59:59",
    });
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("/Turnovers(");
    expect(url).toContain("StartPeriod=datetime");
    expect(url).toContain("EndPeriod=datetime");
    // префикс не задвоился
    expect(url).not.toContain("AccountingRegister_AccountingRegister_");
  });

  it("handleGetAccountingBalance rejects period together with table=Turnovers", async () => {
    await expect(
      handleGetAccountingBalance({
        register_name: "Хозрасчетный",
        table: "Turnovers",
        period: "2026-06-01T00:00:00",
      }),
    ).rejects.toThrow(/start_period/);
  });

  it("handleGetAccountingBalance rejects a period range on table=Balance", async () => {
    await expect(
      handleGetAccountingBalance({
        register_name: "Хозрасчетный",
        table: "Balance",
        start_period: "2026-01-01T00:00:00",
      }),
    ).rejects.toThrow(/Balance takes/);
  });

  it("handleGetAccountingBalance doubles a quote in account_condition", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({ value: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await handleGetAccountingBalance({
      register_name: "Хозрасчетный",
      table: "Balance",
      account_condition: "Account eq 'O'Brien'",
    });
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("AccountCondition=");
    expect(url).toContain("O''Brien");
  });
});

describe("entity name symmetry (normaliseEntity)", () => {
  const okJson = (body: unknown) => ({
    ok: true,
    text: () => Promise.resolve(JSON.stringify(body)),
    headers: new Map(),
  });

  beforeEach(() => {
    process.env["ONEC_BASE_URL"] = "http://1c.test/base";
    process.env["ONEC_LOGIN"] = "u";
    process.env["ONEC_PASSWORD"] = "p";
    resetClient();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("bare and prefixed catalog_name produce the identical path", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({ value: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await handleGetCatalogs({ catalog_name: "Номенклатура", top: 10, skip: 0 });
    await handleGetCatalogs({ catalog_name: "Catalog_Номенклатура", top: 10, skip: 0 });
    expect(fetchMock.mock.calls[0][0]).toBe(fetchMock.mock.calls[1][0]);
  });

  it("leaves a name that already carries the prefix untouched", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okJson({ value: [] }));
    vi.stubGlobal("fetch", fetchMock);

    // Реальные имена с подчёркиваниями внутри: суффикс релиза ERP и табличная часть.
    await handleGetDocuments({ document_type: "Document_ЗаказНаПроизводство2_2", top: 10, skip: 0 });
    expect(decodeURIComponent(fetchMock.mock.calls[0][0]))
      .toContain("Document_ЗаказНаПроизводство2_2");
    expect(fetchMock.mock.calls[0][0]).not.toContain("Document_Document_");
  });

  it("handleGetRegister throws when register_name contradicts register_type", async () => {
    await expect(
      handleGetRegister({
        register_type: "AccumulationRegister",
        register_name: "InformationRegister_ЦеныНоменклатуры",
        top: 10,
        skip: 0,
      }),
    ).rejects.toThrow(/register_type is AccumulationRegister/);
  });
});

describe("list_entities type filter", () => {
  const entitySet = {
    value: [
      { name: "Catalog_Номенклатура", url: "" },
      { name: "Document_РеализацияТоваровУслуг", url: "" },
      { name: "AccumulationRegister_ОстаткиТоваров", url: "" },
      { name: "InformationRegister_ЦеныНоменклатуры", url: "" },
      { name: "AccountingRegister_Хозрасчетный", url: "" },
      { name: "CalculationRegister_Начисления", url: "" },
      { name: "ChartOfAccounts_Хозрасчетный", url: "" },
      { name: "ChartOfCalculationTypes_Основные", url: "" },
      { name: "Constant_ОсновнаяВалюта", url: "" },
      { name: "DocumentJournal_Продажи", url: "" },
      { name: "ExchangePlan_Обмен", url: "" },
      { name: "Report_Продажи", url: "" },
    ],
  };

  beforeEach(() => {
    process.env["ONEC_BASE_URL"] = "http://1c.test/base";
    process.env["ONEC_LOGIN"] = "u";
    process.env["ONEC_PASSWORD"] = "p";
    resetClient();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(entitySet)),
        headers: new Map(),
      }),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const namesFor = async (type: "registers" | "charts" | "constants" | "journals") =>
    JSON.parse(await handleListEntities({ type })).entities as string[];

  it("registers returns all four register kinds", async () => {
    const names = await namesFor("registers");
    expect(names).toEqual([
      "AccumulationRegister_ОстаткиТоваров",
      "InformationRegister_ЦеныНоменклатуры",
      "AccountingRegister_Хозрасчетный",
      "CalculationRegister_Начисления",
    ]);
  });

  it("charts covers all three ChartOf* kinds", async () => {
    expect(await namesFor("charts")).toEqual([
      "ChartOfAccounts_Хозрасчетный",
      "ChartOfCalculationTypes_Основные",
    ]);
  });

  it("constants and journals are filterable", async () => {
    expect(await namesFor("constants")).toEqual(["Constant_ОсновнаяВалюта"]);
    expect(await namesFor("journals")).toEqual(["DocumentJournal_Продажи"]);
  });

  it("ExchangePlan_ remains reachable only via type=all", async () => {
    const all = JSON.parse(await handleListEntities({ type: "all" })).entities as string[];
    expect(all).toContain("ExchangePlan_Обмен");
  });
});
