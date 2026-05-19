import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleCreateSupply } from "../src/tools/supply.js";

describe("supply tool handlers", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["MOYSKLAD_TOKEN"] = "test-token";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("handleCreateSupply POSTs to /entity/supply with organization+agent meta and positions[]", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ id: "supply-1", name: "SUP-0001", moment: "2026-05-19 10:00:00.000", sum: 50_000 })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handleCreateSupply({
      organization_href: "https://api.moysklad.ru/.../organization/abc",
      agent_href: "https://api.moysklad.ru/.../counterparty/xyz",
      positions: [
        { assortment_href: "https://api.moysklad.ru/.../product/p1", quantity: 5, price_rubles: 100 },
      ],
    });
    const parsed = JSON.parse(result);
    expect(parsed.id).toBe("supply-1");
    expect(parsed.sum_rubles).toBe(500); // 50_000 kopecks → 500 RUB

    const [url, opts] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("/entity/supply");
    const body = JSON.parse((opts as RequestInit).body as string);
    expect(body.organization.meta.type).toBe("organization");
    expect(body.agent.meta.type).toBe("counterparty");
    expect(body.positions).toHaveLength(1);
    expect(body.positions[0].price).toBe(10_000); // 100 RUB = 10_000 kopecks
    expect(body.positions[0].assortment.meta.type).toBe("product");
  });

  it("handleCreateSupply attaches optional warehouse + incoming document fields when provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ id: "supply-2" })),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await handleCreateSupply({
      organization_href: "org-href",
      agent_href: "ag-href",
      store_href: "store-href",
      incoming_number: "INV-2026-001",
      incoming_date: "2026-05-15",
      description: "May supply",
      positions: [{ assortment_href: "p1", quantity: 1 }],
    });
    const [, opts] = fetchMock.mock.calls[0]!;
    const body = JSON.parse((opts as RequestInit).body as string);
    expect(body.store.meta.href).toBe("store-href");
    expect(body.store.meta.type).toBe("store");
    expect(body.incomingNumber).toBe("INV-2026-001");
    expect(body.incomingDate).toBe("2026-05-15");
    expect(body.description).toBe("May supply");
  });

  it("handleCreateSupply propagates validation errors from the API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 412,
      text: () => Promise.resolve(JSON.stringify({ errors: [{ error: "Missing required field" }] })),
      headers: new Map(),
    }));
    await expect(
      handleCreateSupply({
        organization_href: "x",
        agent_href: "y",
        positions: [{ assortment_href: "p1", quantity: 1 }],
      }),
    ).rejects.toThrow();
  });
});
