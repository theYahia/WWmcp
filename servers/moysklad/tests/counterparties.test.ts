import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  handleGetCounterparties,
  handleBatchCreateCounterparties,
} from "../src/tools/counterparties.js";

describe("counterparties tool handlers", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["MOYSKLAD_TOKEN"] = "test-token";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("handleGetCounterparties returns total + counterparties[] and forwards search", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({
        meta: { size: 1 },
        rows: [{ id: "c1", name: "ООО Ромашка", inn: "1234567890", companyType: "legal" }],
      })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handleGetCounterparties({ search: "Ромашка", limit: 25, offset: 0 });
    const parsed = JSON.parse(result);
    expect(parsed.total).toBe(1);
    expect(parsed.counterparties[0].inn).toBe("1234567890");
    const [url] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("search=");
  });

  it("handleGetCounterparties builds INN filter when provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ meta: { size: 0 }, rows: [] })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await handleGetCounterparties({ filter_inn: "7707083893", limit: 25, offset: 0 });
    const [url] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("filter=");
    expect(String(url)).toMatch(/inn/);
  });

  it("handleBatchCreateCounterparties POSTs N items in parallel and propagates only present fields", async () => {
    let i = 0;
    const fetchMock = vi.fn().mockImplementation(() => {
      i++;
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({
          id: `c${i}`, name: `Counterparty ${i}`, inn: "1234567890",
        })),
        headers: new Map(),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handleBatchCreateCounterparties({
      items: [
        { name: "ООО А", inn: "1111111111", company_type: "legal" },
        { name: "ИП Б", inn: "222222222222", company_type: "entrepreneur" },
      ],
      concurrency: 5,
    });
    const env = JSON.parse(result);
    expect(env.total).toBe(2);
    expect(env.succeeded).toBe(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // First call body should NOT include kpp/phone/email (not provided)
    const body1 = JSON.parse((fetchMock.mock.calls[0]![1] as RequestInit).body as string);
    expect(body1.name).toBe("ООО А");
    expect(body1.companyType).toBe("legal");
    expect(body1.kpp).toBeUndefined();
    expect(body1.phone).toBeUndefined();
  });

  it("handleBatchCreateCounterparties reports failed items without aborting the rest", async () => {
    let i = 0;
    const fetchMock = vi.fn().mockImplementation(() => {
      i++;
      if (i === 2) {
        return Promise.resolve({
          ok: false,
          status: 412,
          text: () => Promise.resolve(JSON.stringify({ errors: [{ error: "duplicate INN" }] })),
          headers: new Map(),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ id: `c${i}`, name: `OK ${i}` })),
        headers: new Map(),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handleBatchCreateCounterparties({
      items: [
        { name: "OK" },
        { name: "DUP", inn: "1111111111" },
        { name: "OK2" },
      ],
      concurrency: 1, // force serial so call #2 hits the duplicate
    });
    const env = JSON.parse(result);
    expect(env.total).toBe(3);
    expect(env.failed).toBe(1);
    expect(env.failed_indexes).toContain(1);
  });
});
