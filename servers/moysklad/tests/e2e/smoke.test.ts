import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");
const EXPECTED_TOOL_COUNT = 60;

const smoke = () =>
  runSmokeTest({
    serverPath: SERVER_PATH,
    expectedToolCount: EXPECTED_TOOL_COUNT,
    env: { MOYSKLAD_TOKEN: "test" },
  });

describe("MoySklad MCP E2E Smoke Test", () => {
  it(`starts and lists ${EXPECTED_TOOL_COUNT} tools`, async () => {
    const result = await smoke();

    expect(result.connected).toBe(true);
    expect(result.toolCount).toBe(EXPECTED_TOOL_COUNT);
    expect(result.errors).toHaveLength(0);
  }, 15_000);

  it("all tools have quality descriptions (20+ chars)", async () => {
    const result = await smoke();

    for (const tool of result.tools) {
      expect(tool.descriptionLength).toBeGreaterThanOrEqual(20);
      expect(tool.hasInputSchema).toBe(true);
    }
  }, 15_000);

  it("has expected tool names", async () => {
    const result = await smoke();

    const names = result.tools.map((t) => t.name).sort();
    expect(names).toEqual([
      "create_cash_in",
      "create_cash_out",
      "create_counterparty",
      "create_customer_order",
      "create_demand",
      "create_enter",
      "create_inventory",
      "create_invoice_in",
      "create_invoice_out",
      "create_loss",
      "create_move",
      "create_payment_in",
      "create_payment_out",
      "create_product",
      "create_purchase_order",
      "create_purchase_return",
      "create_sales_return",
      "create_service",
      "create_supply",
      "create_webhook",
      "delete_webhook",
      "get_audit",
      "get_counterparties",
      "get_counterparty",
      "get_customer_order",
      "get_dashboard",
      "get_document",
      "get_documents",
      "get_enters",
      "get_entity_audit",
      "get_inventories",
      "get_invoices_out",
      "get_losses",
      "get_metadata",
      "get_money_report",
      "get_moves",
      "get_orders",
      "get_product",
      "get_profit_report",
      "get_purchase_orders",
      "get_sales_report",
      "get_stock",
      "get_stock_by_store",
      "get_stock_current",
      "get_turnover",
      "list_currencies",
      "list_employees",
      "list_organizations",
      "list_price_types",
      "list_product_folders",
      "list_stores",
      "list_webhooks",
      "search_assortment",
      "search_bundles",
      "search_products",
      "search_services",
      "search_variants",
      "update_customer_order_status",
      "update_prices",
      "update_webhook",
    ]);
  }, 15_000);
});
