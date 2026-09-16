import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");
const TOOL_COUNT = 20;

// Подставные значения — сервер только поднимается, наружу не ходит.
const ENV = {
  YOOKASSA_PAYOUT_AGENT_ID: "test",
  YOOKASSA_PAYOUT_SECRET_KEY: "test",
  YOOKASSA_SECRET_KEY: "test",
  YOOKASSA_SHOP_ID: "test",
};

const TOOL_NAMES = [
  "cancel_payment",
  "capture_payment",
  "create_payment",
  "create_payout",
  "create_receipt",
  "create_recurring_payment",
  "create_refund",
  "create_sbp_payment",
  "create_split_payment",
  "create_webhook",
  "delete_webhook",
  "get_payment",
  "get_payout",
  "get_refund",
  "get_shop_info",
  "list_payments",
  "list_receipts",
  "list_refunds",
  "list_webhooks",
  "save_payment_method",
];

describe("Yookassa MCP E2E Smoke Test", () => {
  it("starts and lists 20 tools", async () => {
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
