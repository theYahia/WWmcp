import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");
const TOOL_COUNT = 8;

// Подставные значения — сервер только поднимается, наружу не ходит.
const ENV = {
  ORANGE_MONEY_CLIENT_ID: "test",
  ORANGE_MONEY_CLIENT_SECRET: "test",
  ORANGE_MONEY_MERCHANT_KEY: "test",
};

const TOOL_NAMES = [
  "cashin",
  "cashout",
  "create_webpayment",
  "get_balance",
  "get_payment_status",
  "list_supported_countries",
  "transfer",
  "validate_webhook",
];

describe("Orange Money MCP E2E Smoke Test", () => {
  it("starts and lists 8 tools", async () => {
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
