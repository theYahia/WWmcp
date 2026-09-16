import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");
const TOOL_COUNT = 26;

// Подставные значения — сервер только поднимается, наружу не ходит.
const ENV = {
  IFOOD_CLIENT_ID: "test",
  IFOOD_CLIENT_SECRET: "test",
};

const TOOL_NAMES = [
  "acknowledge_events",
  "cancel_order",
  "confirm_order",
  "create_interruption",
  "delete_interruption",
  "dispatch_order",
  "get_cancellation_reasons",
  "get_merchant",
  "get_merchant_status",
  "get_opening_hours",
  "get_order",
  "list_catalogs",
  "list_categories",
  "list_interruptions",
  "list_items_by_category",
  "list_merchants",
  "list_orders",
  "list_products",
  "ready_to_pickup",
  "set_opening_hours",
  "start_preparation",
  "update_item_price",
  "update_item_status",
  "update_option_price",
  "update_option_status",
  "upsert_item",
];

describe("iFood MCP E2E Smoke Test", () => {
  it("starts and lists 26 tools", async () => {
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
