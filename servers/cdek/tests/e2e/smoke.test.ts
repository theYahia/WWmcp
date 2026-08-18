import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");
const EXPECTED_TOOL_COUNT = 16;
const SMOKE_ENV = {
  CDEK_CLIENT_ID: "test",
  CDEK_CLIENT_SECRET: "test",
  CDEK_SANDBOX: "true",
};

const EXPECTED_TOOLS = [
  "calculate_tariff",
  "calculate_tariff_list",
  "create_courier_pickup",
  "create_order",
  "create_webhook",
  "delete_order",
  "delete_webhook",
  "generate_barcode",
  "get_cities",
  "get_courier_pickup",
  "get_order",
  "get_regions",
  "list_delivery_points",
  "list_orders",
  "print_receipt",
  "track_shipment",
];

describe("CDEK MCP E2E Smoke Test", () => {
  it(`starts and lists ${EXPECTED_TOOL_COUNT} tools`, async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: EXPECTED_TOOL_COUNT,
      env: SMOKE_ENV,
    });

    expect(result.connected).toBe(true);
    expect(result.toolCount).toBe(EXPECTED_TOOL_COUNT);
    expect(result.errors).toHaveLength(0);
  }, 15_000);

  it("all tools have quality descriptions (20+ chars)", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: EXPECTED_TOOL_COUNT,
      env: SMOKE_ENV,
    });

    for (const tool of result.tools) {
      expect(tool.descriptionLength).toBeGreaterThanOrEqual(20);
      expect(tool.hasInputSchema).toBe(true);
    }
  }, 15_000);

  it("has expected tool names", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: EXPECTED_TOOL_COUNT,
      env: SMOKE_ENV,
    });

    const names = result.tools.map((t) => t.name).sort();
    expect(names).toEqual(EXPECTED_TOOLS);
  }, 15_000);
});
