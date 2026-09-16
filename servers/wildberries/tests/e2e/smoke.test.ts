import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");
const TOOL_COUNT = 30;

// Подставные значения — сервер только поднимается, наружу не ходит.
const ENV = {
  WB_API_TOKEN: "test",
};
const TOOL_NAMES = [
  "add_orders_to_supply",
  "create_supply",
  "deliver_supply",
  "get_abc_analysis",
  "get_balance",
  "get_campaign_stats",
  "get_commission",
  "get_fbw_stocks",
  "get_feedbacks",
  "get_funnel",
  "get_incomes",
  "get_new_orders",
  "get_orders",
  "get_paid_storage",
  "get_product",
  "get_questions",
  "get_returns",
  "get_sales",
  "get_statistics",
  "get_stocks",
  "get_supply",
  "get_supply_barcode",
  "get_tariffs",
  "get_warehouses",
  "list_campaigns",
  "list_products",
  "reply_feedback",
  "reply_question",
  "update_prices",
  "update_stocks",
];

describe("Wildberries MCP E2E Smoke Test", () => {
  it("starts and lists 30 tools", async () => {
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
