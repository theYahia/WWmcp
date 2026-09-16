import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");
const TOOL_COUNT = 39;

// Подставные значения — сервер только поднимается, наружу не ходит.
const ENV = {
  RETAILCRM_API_KEY: "test",
  RETAILCRM_DOMAIN: "example.test",
  RETAILCRM_URL: "https://example.test",
};

const TOOL_NAMES = [
  "create_cost",
  "create_customer",
  "create_order",
  "customer_notes_create",
  "customer_notes_delete",
  "customer_notes_list",
  "customers_history",
  "files_get",
  "files_list",
  "files_upload",
  "get_customer",
  "get_customers_summary",
  "get_order",
  "get_orders_summary",
  "list_costs",
  "list_countries",
  "list_customers",
  "list_delivery_types",
  "list_order_methods",
  "list_order_types",
  "list_orders",
  "list_payment_types",
  "list_product_groups",
  "list_products",
  "list_segments",
  "list_sites",
  "list_statuses",
  "list_stores",
  "merge_customers",
  "order_payment_create",
  "order_payment_delete",
  "order_payment_edit",
  "orders_history",
  "store_inventories",
  "tasks_create",
  "tasks_edit",
  "tasks_list",
  "update_customer",
  "update_order",
];

describe("Retailcrm MCP E2E Smoke Test", () => {
  it("starts and lists 39 tools", async () => {
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
