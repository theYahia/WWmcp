import { describe, it, expect, vi } from "vitest";

vi.mock("../src/client.js", () => ({
  moyskladGet: vi.fn(),
  moyskladPost: vi.fn(),
  moyskladPut: vi.fn(),
  moyskladDelete: vi.fn(),
}));

import { moyskladGet, moyskladPost, moyskladPut } from "../src/client.js";
import {
  handleSearchProducts,
  handleGetProduct,
  handleCreateProduct,
  handleUpdatePrices,
} from "../src/tools/products.js";
import { handleGetStock, handleGetStockByStore } from "../src/tools/stock.js";
import {
  handleGetCounterparties,
  handleGetCounterparty,
  handleCreateCounterparty,
} from "../src/tools/counterparties.js";
import {
  handleCreateCustomerOrder,
  handleGetOrders,
  handleGetCustomerOrder,
  handleUpdateCustomerOrderStatus,
} from "../src/tools/orders.js";
import { handleGetProfitReport, handleGetSalesReport } from "../src/tools/reports.js";
import { handleCreateSupply } from "../src/tools/supply.js";
import { handleCreateDemand } from "../src/tools/shipments.js";
import { handleListStores } from "../src/tools/stores.js";
import { handleListOrganizations } from "../src/tools/organizations.js";
import { handleListWebhooks, handleCreateWebhook } from "../src/tools/webhooks.js";
import { _resetPriceTypeCache } from "../src/lib.js";

const mockGet = moyskladGet as ReturnType<typeof vi.fn>;
const mockPost = moyskladPost as ReturnType<typeof vi.fn>;
const mockPut = moyskladPut as ReturnType<typeof vi.fn>;

const PRICE_TYPE_HREF = "https://api.moysklad.ru/api/remap/1.2/context/companysettings/pricetype/pt1";
const priceTypeList = [{ id: "pt1", name: "Цена продажи", meta: { href: PRICE_TYPE_HREF, type: "pricetype" } }];

import { beforeEach } from "vitest";
beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
  mockPut.mockReset();
  _resetPriceTypeCache();
});

describe("search_products", () => {
  it("converts prices from kopecks to rubles", async () => {
    mockGet.mockResolvedValue({
      meta: { size: 1 },
      rows: [{ id: "abc", name: "T", salePrices: [{ value: 150000 }], buyPrice: { value: 100000 } }],
    });
    const r = JSON.parse(await handleSearchProducts({ search: "T", limit: 25, offset: 0 }));
    expect(r.total).toBe(1);
    expect(r.products[0].sale_price_rubles).toBe(1500);
    expect(r.products[0].buy_price_rubles).toBe(1000);
  });
});

describe("get_product", () => {
  it("returns product with prices in rubles", async () => {
    mockGet.mockResolvedValue({ id: "u1", name: "W", salePrices: [{ value: 99900 }], buyPrice: { value: 50000 } });
    const r = JSON.parse(await handleGetProduct({ id: "u1" }));
    expect(r.sale_price_rubles).toBe(999);
    expect(r.buy_price_rubles).toBe(500);
  });
});

describe("create_product", () => {
  it("converts rubles to kopecks and attaches the default price type", async () => {
    mockGet.mockResolvedValue(priceTypeList); // GET /context/companysettings/pricetype
    mockPost.mockResolvedValue({ id: "n", name: "P", salePrices: [{ value: 250050 }], buyPrice: { value: 100000 } });
    const r = JSON.parse(await handleCreateProduct({ name: "P", sale_price_rubles: 2500.5, buy_price_rubles: 1000 }));
    expect(r.sale_price_rubles).toBe(2500.5);
    const b = (mockPost.mock.calls[0] as any)[1];
    expect(b.salePrices[0].value).toBe(250050);
    // The empty-href bug is fixed: a real price type href is attached.
    expect(b.salePrices[0].priceType.meta.href).toBe(PRICE_TYPE_HREF);
  });
});

describe("update_prices", () => {
  it("fetches then PUTs updated prices", async () => {
    mockGet.mockResolvedValue({ salePrices: [{ value: 100000, priceType: { meta: { href: "x" } } }] });
    mockPut.mockResolvedValue({ id: "u1", name: "W", salePrices: [{ value: 200000 }], buyPrice: { value: 150000 } });
    const r = JSON.parse(await handleUpdatePrices({ id: "u1", sale_price_rubles: 2000, buy_price_rubles: 1500 }));
    expect(r.sale_price_rubles).toBe(2000);
    expect(r.buy_price_rubles).toBe(1500);
  });
});

describe("get_stock", () => {
  it("converts salePrice to rubles", async () => {
    mockGet.mockResolvedValue({
      meta: { size: 2 },
      rows: [
        { name: "A", stock: 10, reserve: 2, inTransit: 0, quantity: 8, salePrice: 100000 },
        { name: "B", stock: 5, reserve: 0, inTransit: 3, quantity: 8, salePrice: 200000 },
      ],
    });
    const r = JSON.parse(await handleGetStock({ limit: 25, offset: 0, group_by: "product", stock_mode: "all" }));
    expect(r.items[0].sale_price_rubles).toBe(1000);
    expect(r.items[1].sale_price_rubles).toBe(2000);
  });
});

describe("get_stock_by_store", () => {
  it("calls report/stock/bystore and formats by-store rows", async () => {
    mockGet.mockResolvedValue({
      meta: { size: 1 },
      rows: [{ name: "Item", stockByStore: [{ name: "Main", stock: 50 }] }],
    });
    const r = JSON.parse(await handleGetStockByStore({ limit: 10, offset: 0 }));
    expect(r.items[0].name).toBe("Item");
    expect(r.items[0].by_store[0].store).toBe("Main");
    expect(r.items[0].by_store[0].stock).toBe(50);
    expect(mockGet.mock.calls[0][0]).toContain("/report/stock/bystore");
  });
});

describe("get_counterparties", () => {
  it("returns counterparty data", async () => {
    mockGet.mockResolvedValue({
      meta: { size: 1 },
      rows: [{ id: "c1", name: "OOO", inn: "7707083893", companyType: "legal" }],
    });
    const r = JSON.parse(await handleGetCounterparties({ search: "OOO", limit: 25, offset: 0 }));
    expect(r.counterparties[0].inn).toBe("7707083893");
  });
});

describe("get_counterparty", () => {
  it("fetches single counterparty by id", async () => {
    mockGet.mockResolvedValue({ id: "c1", name: "OOO Test", inn: "1234567890" });
    const r = JSON.parse(await handleGetCounterparty({ id: "c1" }));
    expect(r.name).toBe("OOO Test");
    expect(mockGet.mock.calls[0][0]).toContain("/entity/counterparty/c1");
  });
});

describe("create_counterparty", () => {
  it("sends correct body", async () => {
    mockPost.mockResolvedValue({ id: "new", name: "New Corp" });
    const r = JSON.parse(await handleCreateCounterparty({ name: "New Corp", inn: "9876543210", companyType: "legal" }));
    expect(r.name).toBe("New Corp");
    const b = (mockPost.mock.calls[0] as any)[1];
    expect(b.inn).toBe("9876543210");
    expect(b.companyType).toBe("legal");
  });
});

describe("create_customer_order", () => {
  it("converts rubles to kopecks in positions", async () => {
    mockPost.mockResolvedValue({ id: "o1", name: "001", moment: "2024-01-15", sum: 500000 });
    const r = JSON.parse(
      await handleCreateCustomerOrder({
        organization_href: "https://api.moysklad.ru/api/remap/1.2/entity/organization/o1",
        agent_href: "https://api.moysklad.ru/api/remap/1.2/entity/counterparty/c1",
        positions: [
          {
            assortment_href: "https://api.moysklad.ru/api/remap/1.2/entity/product/p1",
            quantity: 5,
            price_rubles: 1000,
          },
        ],
      }),
    );
    expect(r.sum_rubles).toBe(5000);
    const b = (mockPost.mock.calls[0] as any)[1];
    expect(b.positions[0].price).toBe(100000);
  });
});

describe("get_orders", () => {
  it("converts order sums to rubles", async () => {
    mockGet.mockResolvedValue({
      meta: { size: 1 },
      rows: [{ id: "o1", name: "001", moment: "2024-01-15", sum: 300000 }],
    });
    const r = JSON.parse(await handleGetOrders({ limit: 10, offset: 0, order: "created,desc" }));
    expect(r.orders[0].sum_rubles).toBe(3000);
  });
});

describe("get_customer_order", () => {
  it("fetches single order by id with expand", async () => {
    mockGet.mockResolvedValue({ id: "o1", name: "001", positions: { rows: [] } });
    const r = JSON.parse(await handleGetCustomerOrder({ id: "o1" }));
    expect(r.id).toBe("o1");
    expect(mockGet.mock.calls[0][0]).toContain("expand=positions");
  });
});

describe("update_customer_order_status", () => {
  it("sends state meta via PUT", async () => {
    mockPut.mockResolvedValue({ id: "o1", name: "001", sum: 100000 });
    await handleUpdateCustomerOrderStatus({ id: "o1", state_href: "https://api.moysklad.ru/state/s1" });
    const b = (mockPut.mock.calls[0] as any)[1];
    expect(b.state.meta.type).toBe("state");
    expect(b.state.meta.href).toBe("https://api.moysklad.ru/state/s1");
  });
});

describe("get_profit_report", () => {
  it("converts profit amounts to rubles", async () => {
    mockGet.mockResolvedValue({
      meta: { size: 1 },
      rows: [
        {
          assortment: { name: "PA" },
          sellQuantity: 100,
          sellSum: 10000000,
          sellCostSum: 5000000,
          returnQuantity: 2,
          returnSum: 200000,
          profit: 4800000,
          margin: 48,
        },
      ],
    });
    const r = JSON.parse(await handleGetProfitReport({ limit: 25, offset: 0 }));
    expect(r.items[0].profit_rubles).toBe(48000);
    expect(r.items[0].margin).toBe(48);
  });
});

describe("get_sales_report", () => {
  it("calls report/sales/byproduct and formats rows", async () => {
    mockGet.mockResolvedValue({
      meta: { size: 1 },
      rows: [{ assortment: { name: "X" }, sellQuantity: 10, sellSum: 500000 }],
    });
    const r = JSON.parse(await handleGetSalesReport({ limit: 10, offset: 0 }));
    expect(r.items[0].product_name).toBe("X");
    expect(r.items[0].sell_quantity).toBe(10);
    expect(r.items[0].sell_sum_rubles).toBe(5000);
    expect(mockGet.mock.calls[0][0]).toContain("/report/sales/byproduct");
  });
});

describe("create_supply", () => {
  it("creates supply with kopeck conversion", async () => {
    mockPost.mockResolvedValue({
      id: "s1",
      name: "001",
      moment: "2024-01-15",
      sum: 1000000,
      created: "2024-01-15T10:00:00",
    });
    const r = JSON.parse(
      await handleCreateSupply({
        organization_href: "https://api.moysklad.ru/api/remap/1.2/entity/organization/o1",
        agent_href: "https://api.moysklad.ru/api/remap/1.2/entity/counterparty/c1",
        positions: [
          {
            assortment_href: "https://api.moysklad.ru/api/remap/1.2/entity/product/p1",
            quantity: 10,
            price_rubles: 500,
          },
        ],
      }),
    );
    expect(r.sum_rubles).toBe(10000);
    const b = (mockPost.mock.calls[0] as any)[1];
    expect(b.positions[0].price).toBe(50000);
  });
});

describe("create_demand", () => {
  it("includes store and optional customerOrder link", async () => {
    mockPost.mockResolvedValue({ id: "d1", name: "D001", moment: "2024-01-15", sum: 500000, created: "2024-01-15" });
    const r = JSON.parse(
      await handleCreateDemand({
        organization_href: "https://api.moysklad.ru/api/remap/1.2/entity/organization/org-1",
        agent_href: "https://api.moysklad.ru/api/remap/1.2/entity/counterparty/cp-1",
        store_href: "https://api.moysklad.ru/api/remap/1.2/entity/store/s-1",
        customer_order_href: "https://api.moysklad.ru/api/remap/1.2/entity/customerorder/co-1",
        positions: [{ assortment_href: "https://api.moysklad.ru/api/remap/1.2/entity/product/p-1", quantity: 2 }],
      }),
    );
    expect(r.sum_rubles).toBe(5000);
    const b = (mockPost.mock.calls[0] as any)[1];
    expect(b.store.meta.type).toBe("store");
    expect(b.customerOrder.meta.type).toBe("customerorder");
  });
});

describe("list_stores", () => {
  it("returns formatted stores", async () => {
    mockGet.mockResolvedValue({
      meta: { size: 1 },
      rows: [{ id: "s1", name: "Main warehouse", meta: { href: "https://api.moysklad.ru/entity/store/s1" } }],
    });
    const r = JSON.parse(await handleListStores({ limit: 100, offset: 0 }));
    expect(r.stores[0].name).toBe("Main warehouse");
    expect(r.stores[0].meta_href).toContain("/entity/store/");
  });
});

describe("list_organizations", () => {
  it("returns formatted organizations", async () => {
    mockGet.mockResolvedValue({
      meta: { size: 1 },
      rows: [
        {
          id: "o1",
          name: "OOO MyCompany",
          inn: "1234567890",
          meta: { href: "https://api.moysklad.ru/entity/organization/o1" },
        },
      ],
    });
    const r = JSON.parse(await handleListOrganizations({ limit: 100, offset: 0 }));
    expect(r.organizations[0].inn).toBe("1234567890");
    expect(mockGet.mock.calls[0][0]).toContain("/entity/organization");
  });
});

describe("list_webhooks", () => {
  it("calls /entity/webhook and formats rows", async () => {
    mockGet.mockResolvedValue({
      meta: { size: 1 },
      rows: [{ id: "wh1", url: "https://example.com/hook", action: "CREATE", entityType: "customerorder" }],
    });
    const r = JSON.parse(await handleListWebhooks({ limit: 100, offset: 0 }));
    expect(r.webhooks[0].action).toBe("CREATE");
    expect(mockGet.mock.calls[0][0]).toContain("/entity/webhook");
  });
});

describe("create_webhook", () => {
  it("sends correct webhook body", async () => {
    mockPost.mockResolvedValue({
      id: "wh1",
      url: "https://example.com/hook",
      action: "CREATE",
      entityType: "customerorder",
    });
    const r = JSON.parse(
      await handleCreateWebhook({ url: "https://example.com/hook", action: "CREATE", entityType: "customerorder" }),
    );
    expect(r.action).toBe("CREATE");
    const b = (mockPost.mock.calls[0] as any)[1];
    expect(b.entityType).toBe("customerorder");
  });
});
