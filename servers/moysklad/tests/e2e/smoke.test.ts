import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");

describe("MoySklad MCP E2E Smoke Test", () => {
  it("starts and lists 10 tools", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: 10,
      env: { MOYSKLAD_TOKEN: "test" },
    });

    expect(result.connected).toBe(true);
    expect(result.toolCount).toBe(10);
    expect(result.errors).toHaveLength(0);
  }, 15_000);

  it("all tools have quality descriptions (20+ chars)", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: 10,
      env: { MOYSKLAD_TOKEN: "test" },
    });

    for (const tool of result.tools) {
      expect(tool.descriptionLength).toBeGreaterThanOrEqual(20);
      expect(tool.hasInputSchema).toBe(true);
    }
  }, 15_000);

  it("has expected tool names", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: 10,
      env: { MOYSKLAD_TOKEN: "test" },
    });

    const names = result.tools.map((t) => t.name).sort();
    expect(names).toEqual([
      "create_customer_order",
      "create_product",
      "create_supply",
      "get_counterparties",
      "get_orders",
      "get_product",
      "get_profit_report",
      "get_stock",
      "search_products",
      "update_prices",
    ]);
  }, 15_000);
});
