import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/client.js", () => ({
  moyskladGet: vi.fn(),
  moyskladPost: vi.fn(),
  moyskladPut: vi.fn(),
  moyskladDelete: vi.fn(),
}));

import { moyskladGet, moyskladPost, moyskladDelete } from "../src/client.js";
import { handleCreateMove, handleGetDocuments, handleGetDocument } from "../src/tools/documents.js";
import { handleCreatePaymentIn, handleCreatePaymentOut } from "../src/tools/finance.js";
import { handleSearchAssortment, handleListPriceTypes } from "../src/tools/catalog.js";
import { handleDeleteWebhook, handleUpdateWebhook } from "../src/tools/webhooks.js";
import { handleGetCounterparties } from "../src/tools/counterparties.js";

const mockGet = moyskladGet as ReturnType<typeof vi.fn>;
const mockPost = moyskladPost as ReturnType<typeof vi.fn>;
const mockDelete = moyskladDelete as ReturnType<typeof vi.fn>;

const HREF = (type: string, id = "id1") => `https://api.moysklad.ru/api/remap/1.2/entity/${type}/${id}`;

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
  mockDelete.mockReset();
});

describe("create_move", () => {
  it("sends source/target stores and positions", async () => {
    mockPost.mockResolvedValue({ id: "m1", name: "00001", moment: "2026-06-23", sum: 0 });
    await handleCreateMove({
      organization_href: HREF("organization"),
      source_store_href: HREF("store", "a"),
      target_store_href: HREF("store", "b"),
      positions: [{ assortment_href: HREF("product", "p1"), quantity: 10 }],
    });
    expect(mockPost.mock.calls[0][0]).toBe("/entity/move");
    const b = (mockPost.mock.calls[0] as any)[1];
    expect(b.sourceStore.meta.type).toBe("store");
    expect(b.targetStore.meta.type).toBe("store");
    expect(b.positions[0].assortment.meta.type).toBe("product");
    expect(b.positions[0].quantity).toBe(10);
  });
});

describe("create_payment_in / create_payment_out", () => {
  it("converts sum to kopecks", async () => {
    mockPost.mockResolvedValue({ id: "p1", name: "00001", sum: 150000 });
    const r = JSON.parse(
      await handleCreatePaymentIn({
        organization_href: HREF("organization"),
        agent_href: HREF("counterparty"),
        sum_rubles: 1500,
      }),
    );
    expect(r.sum_rubles).toBe(1500);
    expect((mockPost.mock.calls[0] as any)[1].sum).toBe(150000);
    expect(mockPost.mock.calls[0][0]).toBe("/entity/paymentin");
  });

  it("attaches expenseItem when provided", async () => {
    mockPost.mockResolvedValue({ id: "po1", sum: 50000 });
    await handleCreatePaymentOut({
      organization_href: HREF("organization"),
      agent_href: HREF("counterparty"),
      sum_rubles: 500,
      expense_item_href: HREF("expenseitem", "e1"),
    });
    expect(mockPost.mock.calls[0][0]).toBe("/entity/paymentout");
    expect((mockPost.mock.calls[0] as any)[1].expenseItem.meta.type).toBe("expenseitem");
  });
});

describe("search_assortment", () => {
  it("formats unified rows with type and price", async () => {
    mockGet.mockResolvedValue({
      meta: { size: 1 },
      rows: [
        {
          id: "a1",
          name: "Item",
          article: "A1",
          salePrices: [{ value: 100000 }],
          meta: { type: "variant", href: "H" },
        },
      ],
    });
    const r = JSON.parse(await handleSearchAssortment({ search: "Item", limit: 25, offset: 0 }));
    expect(r.assortment[0].type).toBe("variant");
    expect(r.assortment[0].sale_price_rubles).toBe(1000);
    expect(mockGet.mock.calls[0][0]).toContain("/entity/assortment");
  });
});

describe("list_price_types", () => {
  it("marks the first price type as default", async () => {
    mockGet.mockResolvedValue([
      { id: "pt1", name: "Sale", meta: { href: "H1" } },
      { id: "pt2", name: "Wholesale", meta: { href: "H2" } },
    ]);
    const r = JSON.parse(await handleListPriceTypes());
    expect(r.total).toBe(2);
    expect(r.price_types[0].is_default).toBe(true);
    expect(r.price_types[1].is_default).toBe(false);
  });
});

describe("generic get_documents / get_document", () => {
  it("lists any entity type", async () => {
    mockGet.mockResolvedValue({ meta: { size: 1 }, rows: [{ id: "d1", name: "00001", sum: 10000 }] });
    const r = JSON.parse(await handleGetDocuments({ entity_type: "invoiceout", limit: 25, offset: 0 }));
    expect(r.documents[0].sum_rubles).toBe(100);
    expect(mockGet.mock.calls[0][0]).toContain("/entity/invoiceout");
  });
  it("gets a single document with positions expanded", async () => {
    mockGet.mockResolvedValue({ id: "d1" });
    await handleGetDocument({ entity_type: "demand", id: "d1" });
    expect(mockGet.mock.calls[0][0]).toBe("/entity/demand/d1?expand=positions");
  });
});

describe("webhooks: update & delete", () => {
  it("update_webhook sends only provided fields", async () => {
    mockGet.mockReset();
    const mockPut = (await import("../src/client.js")).moyskladPut as ReturnType<typeof vi.fn>;
    mockPut.mockReset();
    mockPut.mockResolvedValue({ id: "w1", enabled: false });
    await handleUpdateWebhook({ id: "w1", enabled: false });
    const b = (mockPut.mock.calls[0] as any)[1];
    expect(b.enabled).toBe(false);
    expect(b.url).toBeUndefined();
    expect(mockPut.mock.calls[0][0]).toBe("/entity/webhook/w1");
  });
  it("delete_webhook calls DELETE", async () => {
    mockDelete.mockResolvedValue({ success: true });
    const r = JSON.parse(await handleDeleteWebhook({ id: "w1" }));
    expect(r.deleted).toBe("w1");
    expect(mockDelete.mock.calls[0][0]).toBe("/entity/webhook/w1");
  });
});

describe("filter injection guard", () => {
  it("rejects an INN filter containing ';'", async () => {
    await expect(handleGetCounterparties({ filter_inn: "1;phone=2", limit: 25, offset: 0 })).rejects.toThrow(
      /must not contain/,
    );
  });
});
