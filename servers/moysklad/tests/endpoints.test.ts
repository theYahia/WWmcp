import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/client.js", () => ({
  moyskladGet: vi.fn(),
  moyskladPost: vi.fn(),
  moyskladPut: vi.fn(),
  moyskladDelete: vi.fn(),
}));

import { moyskladGet, moyskladPost } from "../src/client.js";
import * as documents from "../src/tools/documents.js";
import * as finance from "../src/tools/finance.js";
import * as catalog from "../src/tools/catalog.js";
import * as reportsExtra from "../src/tools/reports_extra.js";
import * as reference from "../src/tools/reference.js";
import * as audit from "../src/tools/audit.js";

const mockGet = moyskladGet as ReturnType<typeof vi.fn>;
const mockPost = moyskladPost as ReturnType<typeof vi.fn>;

const ORG = "https://api.moysklad.ru/api/remap/1.2/entity/organization/o1";
const AGENT = "https://api.moysklad.ru/api/remap/1.2/entity/counterparty/c1";
const STORE = "https://api.moysklad.ru/api/remap/1.2/entity/store/s1";
const PROD = "https://api.moysklad.ru/api/remap/1.2/entity/product/p1";
const POS = [{ assortment_href: PROD, quantity: 1 }];

beforeEach(() => {
  mockGet.mockReset();
  mockGet.mockResolvedValue({ meta: { size: 0 }, rows: [] });
  mockPost.mockReset();
  mockPost.mockResolvedValue({ id: "x" });
});

describe("POST document/finance endpoints hit the right path", () => {
  const cases: Array<[string, () => Promise<unknown>]> = [
    ["/entity/enter", () => documents.handleCreateEnter({ organization_href: ORG, store_href: STORE, positions: POS })],
    ["/entity/loss", () => documents.handleCreateLoss({ organization_href: ORG, store_href: STORE, positions: POS })],
    ["/entity/inventory", () => documents.handleCreateInventory({ organization_href: ORG, store_href: STORE })],
    [
      "/entity/purchaseorder",
      () => documents.handleCreatePurchaseOrder({ organization_href: ORG, agent_href: AGENT, positions: POS }),
    ],
    [
      "/entity/salesreturn",
      () =>
        documents.handleCreateSalesReturn({
          organization_href: ORG,
          agent_href: AGENT,
          store_href: STORE,
          positions: POS,
        }),
    ],
    [
      "/entity/purchasereturn",
      () =>
        documents.handleCreatePurchaseReturn({
          organization_href: ORG,
          agent_href: AGENT,
          store_href: STORE,
          positions: POS,
        }),
    ],
    [
      "/entity/cashin",
      () => finance.handleCreateCashIn({ organization_href: ORG, agent_href: AGENT, sum_rubles: 100 }),
    ],
    [
      "/entity/cashout",
      () => finance.handleCreateCashOut({ organization_href: ORG, agent_href: AGENT, sum_rubles: 100 }),
    ],
    [
      "/entity/invoiceout",
      () => finance.handleCreateInvoiceOut({ organization_href: ORG, agent_href: AGENT, positions: POS }),
    ],
    [
      "/entity/invoicein",
      () => finance.handleCreateInvoiceIn({ organization_href: ORG, agent_href: AGENT, positions: POS }),
    ],
    ["/entity/service", () => catalog.handleCreateService({ name: "Доставка" })],
  ];
  it.each(cases)("POST %s", async (path, run) => {
    await run();
    expect(mockPost.mock.calls[0][0]).toBe(path);
  });
});

describe("GET list/report endpoints hit the right path", () => {
  const cases: Array<[string, () => Promise<unknown>]> = [
    ["/entity/move", () => documents.handleGetMoves({ limit: 25, offset: 0 })],
    ["/entity/enter", () => documents.handleGetEnters({ limit: 25, offset: 0 })],
    ["/entity/loss", () => documents.handleGetLosses({ limit: 25, offset: 0 })],
    ["/entity/inventory", () => documents.handleGetInventories({ limit: 25, offset: 0 })],
    ["/entity/purchaseorder", () => documents.handleGetPurchaseOrders({ limit: 25, offset: 0 })],
    ["/entity/invoiceout", () => finance.handleGetInvoicesOut({ limit: 25, offset: 0 })],
    ["/entity/variant", () => catalog.handleSearchVariants({ limit: 25, offset: 0 })],
    ["/entity/bundle", () => catalog.handleSearchBundles({ limit: 25, offset: 0 })],
    ["/entity/service", () => catalog.handleSearchServices({ limit: 25, offset: 0 })],
    ["/report/dashboard/day", () => reportsExtra.handleGetDashboard({ period: "day" })],
    ["/report/turnover/all", () => reportsExtra.handleGetTurnover({ limit: 25, offset: 0 })],
    ["/report/money/byaccount", () => reportsExtra.handleGetMoneyReport()],
    ["/report/stock/all/current", () => reportsExtra.handleGetStockCurrent({})],
    ["/entity/employee", () => reference.handleListEmployees({ limit: 100, offset: 0 })],
    ["/entity/currency", () => reference.handleListCurrencies({ limit: 100, offset: 0 })],
    ["/entity/productfolder", () => reference.handleListProductFolders({ limit: 100, offset: 0 })],
    ["/entity/customerorder/metadata", () => reference.handleGetMetadata({ entity_type: "customerorder" })],
    ["/audit", () => audit.handleGetAudit({ limit: 25, offset: 0 })],
  ];
  it.each(cases)("GET %s", async (path, run) => {
    await run();
    expect(mockGet.mock.calls[0][0]).toContain(path);
  });
});
