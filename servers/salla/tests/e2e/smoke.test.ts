import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");
const TOOL_COUNT = 22;

// Подставные значения — сервер только поднимается, наружу не ходит.
const ENV = {
  SALLA_ACCESS_TOKEN: "test",
};

const TOOL_NAMES = [
  "bulk_update_quantities",
  "create_category",
  "create_product",
  "delete_product",
  "get_category",
  "get_customer",
  "get_order",
  "get_order_histories",
  "get_product",
  "get_product_by_sku",
  "get_store_info",
  "list_abandoned_carts",
  "list_branches",
  "list_brands",
  "list_categories",
  "list_coupons",
  "list_customers",
  "list_order_statuses",
  "list_orders",
  "list_products",
  "update_order_status",
  "update_product",
];

describe("Salla MCP E2E Smoke Test", () => {
  it("starts and lists 22 tools", async () => {
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
