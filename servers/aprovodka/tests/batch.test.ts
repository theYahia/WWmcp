import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  handleBatchCreateDocuments,
  handleBatchUpdateCatalogItems,
  handleBatchQuery,
} from "../src/tools/batch.js";
import { resetClient } from "../src/client.js";

function makeFetch(handler: (url: string, opts: RequestInit) => Response | Promise<Response>): ReturnType<typeof vi.fn> {
  return vi.fn(async (url: string, opts: RequestInit) => {
    const resp = await handler(url, opts);
    return resp;
  });
}

function okResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    text: () => Promise.resolve(JSON.stringify(body)),
    headers: new Map(),
  } as unknown as Response;
}

function errResponse(status: number, body: string): Response {
  return {
    ok: false,
    status,
    statusText: "Error",
    text: () => Promise.resolve(body),
    headers: new Map(),
  } as unknown as Response;
}

describe("batch tools", () => {
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

  // ────────────────────────────────────────────────────────────────────
  // batch_create_documents
  // ────────────────────────────────────────────────────────────────────

  it("batch_create_documents: happy path — all 3 succeed", async () => {
    let counter = 0;
    const fetchMock = makeFetch(() => {
      const id = ++counter;
      return okResponse({ Ref_Key: `uuid-${id}` });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handleBatchCreateDocuments({
      document_type: "Document_Test",
      documents: [
        { Number: "001" },
        { Number: "002" },
        { Number: "003" },
      ],
      concurrency: 5,
    });
    const parsed = JSON.parse(result) as { total: number; succeeded: number; failed: number; results: Array<{ index: number; status: string }> };
    expect(parsed.total).toBe(3);
    expect(parsed.succeeded).toBe(3);
    expect(parsed.failed).toBe(0);
    // All three POSTs hit the same path
    expect(fetchMock).toHaveBeenCalledTimes(3);
    for (const call of fetchMock.mock.calls) {
      expect(call[1].method).toBe("POST");
    }
  });

  it("batch_create_documents: partial failure — 1 of 3 fails, batch does NOT abort", async () => {
    let counter = 0;
    const fetchMock = makeFetch(() => {
      counter++;
      if (counter === 2) {
        // Second request fails with 400 + 1C-style error body
        return errResponse(400, '{"odata.error":{"message":{"value":"Поле Контрагент не заполнено"}}}');
      }
      return okResponse({ Ref_Key: `uuid-${counter}` });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handleBatchCreateDocuments({
      document_type: "Document_Test",
      documents: [
        { Number: "001" },
        { Number: "002" }, // bad
        { Number: "003" },
      ],
      concurrency: 5,
    });
    const parsed = JSON.parse(result) as {
      total: number; succeeded: number; failed: number;
      results: Array<{ index: number; status: string; error?: string }>;
      failed_indexes: number[];
    };
    expect(parsed.total).toBe(3);
    expect(parsed.succeeded).toBe(2);
    expect(parsed.failed).toBe(1);
    expect(parsed.failed_indexes).toEqual([1]);
    // The failed item's error message should be enriched with 1C hint
    const failed = parsed.results.find((r) => r.status === "error")!;
    expect(failed.error).toMatch(/field_required|Поле/);
  });

  it("batch_create_documents: respects concurrency cap (3 items, cap=1 → serial)", async () => {
    const callTimes: number[] = [];
    const fetchMock = makeFetch(() => {
      callTimes.push(Date.now());
      return new Promise<Response>((resolve) => {
        // 20ms artificial delay so we can detect overlapping vs serial
        setTimeout(() => resolve(okResponse({ Ref_Key: "x" })), 20);
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const start = Date.now();
    await handleBatchCreateDocuments({
      document_type: "Document_Test",
      documents: [{ N: 1 }, { N: 2 }, { N: 3 }],
      concurrency: 1, // serial
    });
    const elapsed = Date.now() - start;
    // With concurrency=1, three 20ms calls = ≥60ms.
    // With concurrency=3, would be ≤30ms. Use a generous lower bound.
    expect(elapsed).toBeGreaterThanOrEqual(50);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("batch_create_documents: surfaces 1C native-batch caveat in `note`", async () => {
    vi.stubGlobal("fetch", makeFetch(() => okResponse({ Ref_Key: "x" })));
    const result = await handleBatchCreateDocuments({
      document_type: "Document_Test",
      documents: [{ N: 1 }],
      concurrency: 5,
    });
    const parsed = JSON.parse(result) as { note: string };
    expect(parsed.note).toMatch(/does not natively support .*\$batch/i);
  });

  // ────────────────────────────────────────────────────────────────────
  // batch_update_catalog_items
  // ────────────────────────────────────────────────────────────────────

  it("batch_update_catalog_items: PATCHes each item by Ref_Key", async () => {
    const urls: string[] = [];
    const fetchMock = makeFetch((url, opts) => {
      urls.push(url);
      expect(opts.method).toBe("PATCH");
      return okResponse({ Ref_Key: "ok" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handleBatchUpdateCatalogItems({
      catalog_name: "Catalog_Номенклатура",
      updates: [
        { ref_key: "aaaaaaaa-1111-1111-1111-111111111111", data: { Description: "A" } },
        { ref_key: "bbbbbbbb-2222-2222-2222-222222222222", data: { Description: "B" } },
      ],
      concurrency: 5,
    });
    const parsed = JSON.parse(result) as { succeeded: number; failed: number };
    expect(parsed.succeeded).toBe(2);
    expect(parsed.failed).toBe(0);
    expect(urls.some((u) => u.includes("aaaaaaaa-1111-1111-1111-111111111111"))).toBe(true);
    expect(urls.some((u) => u.includes("bbbbbbbb-2222-2222-2222-222222222222"))).toBe(true);
  });

  // ────────────────────────────────────────────────────────────────────
  // batch_query
  // ────────────────────────────────────────────────────────────────────

  it("batch_query: runs N GETs in parallel", async () => {
    const urls: string[] = [];
    const fetchMock = makeFetch((url, opts) => {
      urls.push(url);
      expect(opts.method).toBe("GET");
      return okResponse({ value: [{ Ref_Key: "x" }] });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handleBatchQuery({
      queries: [
        { entity: "Catalog_Foo", top: 10, skip: 0 },
        { entity: "Document_Bar", filter: "Posted eq true", top: 50, skip: 0 },
      ],
      concurrency: 5,
    });
    const parsed = JSON.parse(result) as { succeeded: number; total: number };
    expect(parsed.total).toBe(2);
    expect(parsed.succeeded).toBe(2);
    expect(urls.length).toBe(2);
    expect(urls.some((u) => u.includes("Catalog_Foo"))).toBe(true);
    expect(urls.some((u) => u.includes("Document_Bar"))).toBe(true);
    expect(urls.some((u) => u.includes("$filter="))).toBe(true);
  });

  it("batch_query: one of three fails with 404 → reported in failed_indexes", async () => {
    let counter = 0;
    const fetchMock = makeFetch(() => {
      counter++;
      if (counter === 2) return errResponse(404, "not found");
      return okResponse({ value: [] });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handleBatchQuery({
      queries: [
        { entity: "Catalog_A", top: 10, skip: 0 },
        { entity: "Catalog_B", top: 10, skip: 0 },
        { entity: "Catalog_C", top: 10, skip: 0 },
      ],
      concurrency: 5,
    });
    const parsed = JSON.parse(result) as { succeeded: number; failed: number; failed_indexes: number[] };
    expect(parsed.failed).toBe(1);
    expect(parsed.failed_indexes).toEqual([1]);
  });
});
