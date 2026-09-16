/**
 * Кэш схемы и собственный таймаут `get_metadata`.
 *
 * `$metadata` — самый тяжёлый вызов сервера и единственный, чей ответ неизменен в
 * пределах сессии. До WORK-1512 он перезапрашивался каждый раз, шёл с общим
 * таймаутом 15 с (на ERP это гарантированный отказ) и при переполнении лимита
 * отдавал модели обрубок EDMX — невалидный XML, по которому она додумывала схему.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  handleGetMetadata,
  handleListEntities,
  resetMetadataCache,
} from "../src/tools/metadata.js";
import { resetClient } from "../src/client.js";
import { RESPONSE_BUDGET } from "../src/lib/paging.js";

const EDMX = '<edmx:Edmx Version="1.0"><edmx:DataServices/></edmx:Edmx>';

function mockText(text: string) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(text),
    headers: new Map(),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("get_metadata: кэш, таймаут, отказ вместо обрубка", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["ONEC_BASE_URL"] = "http://localhost:8080/base";
    process.env["ONEC_LOGIN"] = "admin";
    process.env["ONEC_PASSWORD"] = "secret";
    resetClient();
    resetMetadataCache();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.useRealTimers();
    vi.restoreAllMocks();
    resetClient();
    resetMetadataCache();
  });

  it("два подряд get_metadata — ровно один fetch", async () => {
    const fetchMock = mockText(EDMX);

    const first = await handleGetMetadata({});
    const second = await handleGetMetadata({});

    expect(first).toBe(EDMX);
    expect(second).toBe(EDMX);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("смена ONEC_BASE_URL не отдаёт схему прежней базы", async () => {
    const fetchMock = mockText(EDMX);
    await handleGetMetadata({});

    process.env["ONEC_BASE_URL"] = "http://localhost:8080/other";
    resetClient();
    await handleGetMetadata({});

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("два подряд list_entities — ровно один fetch корня OData", async () => {
    const fetchMock = mockText(
      JSON.stringify({ value: [{ name: "Catalog_Номенклатура", url: "Catalog_Номенклатура" }] }),
    );

    const all = JSON.parse(await handleListEntities({ type: "all" }));
    const docs = JSON.parse(await handleListEntities({ type: "documents" }));

    expect(all.entities).toEqual(["Catalog_Номенклатура"]);
    // Фильтр работает поверх кэша и его не портит.
    expect(docs.entities).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("ответ через 60 с при таймауте 120 с не прерывается", async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) => {
        signal = init.signal ?? undefined;
        return new Promise((resolve) => {
          setTimeout(
            () => resolve({ ok: true, text: () => Promise.resolve(EDMX), headers: new Map() }),
            60_000,
          );
        });
      }),
    );

    const pending = handleGetMetadata({});
    await vi.advanceTimersByTimeAsync(60_000);

    // При общем таймауте 15 с запрос был бы прерван на 15-й секунде.
    expect(signal?.aborted).toBe(false);
    await expect(pending).resolves.toBe(EDMX);
  });

  it("ответ длиннее лимита — ошибка про describe_entity, а не обрезанный XML", async () => {
    const huge = "<edmx:Edmx>" + "x".repeat(RESPONSE_BUDGET) + "</edmx:Edmx>";
    mockText(huge);

    await expect(handleGetMetadata({})).rejects.toThrow(/describe_entity/);
  });
});
