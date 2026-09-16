import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");
const TOOL_COUNT = 37;

// Подставные значения — сервер только поднимается, наружу не ходит
// (OAuth-токен берётся лениво, при первом вызове инструмента).
const ENV = {
  PARASUT_CLIENT_ID: "test",
  PARASUT_CLIENT_SECRET: "test",
  PARASUT_USERNAME: "test@example.com",
  PARASUT_PASSWORD: "test",
  PARASUT_COMPANY_ID: "1",
};

const TOOL_NAMES = [
  "archive_sales_invoice",
  "cancel_purchase_bill",
  "cancel_sales_invoice",
  "check_einvoice_inbox",
  "collect_from_contact",
  "convert_estimate_to_invoice",
  "create_contact",
  "create_e_archive",
  "create_e_invoice",
  "create_product",
  "create_purchase_bill",
  "create_sales_invoice",
  "get_account",
  "get_contact",
  "get_me",
  "get_product",
  "get_purchase_bill",
  "get_sales_invoice",
  "get_sales_offer",
  "get_trackable_job",
  "issue_e_document",
  "list_account_transactions",
  "list_accounts",
  "list_contacts",
  "list_item_categories",
  "list_products",
  "list_purchase_bills",
  "list_sales_invoices",
  "list_sales_offers",
  "list_tags",
  "list_taxes",
  "list_warehouses",
  "pay_to_contact",
  "record_purchase_bill_payment",
  "record_sales_invoice_payment",
  "recover_sales_invoice",
  "update_sales_offer_status",
];

describe("Parasut MCP E2E Smoke Test", () => {
  it("starts and lists 37 tools", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: TOOL_COUNT,
      env: ENV,
    });

    expect(result.connected).toBe(true);
    expect(result.toolCount).toBe(TOOL_COUNT);
    expect(result.errors).toHaveLength(0);
  }, 15_000);

  it("all tools have quality descriptions (20+ chars)", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: TOOL_COUNT,
      env: ENV,
    });

    for (const tool of result.tools) {
      expect(tool.descriptionLength).toBeGreaterThanOrEqual(20);
      expect(tool.hasInputSchema).toBe(true);
    }
  }, 15_000);

  it("has expected tool names", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: TOOL_COUNT,
      env: ENV,
    });

    const names = result.tools.map((t) => t.name).sort();
    expect(names).toEqual(TOOL_NAMES);
  }, 15_000);
});
