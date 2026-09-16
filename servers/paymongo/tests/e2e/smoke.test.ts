import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");
const TOOL_COUNT = 24;

// Подставные значения — сервер только поднимается, наружу не ходит.
const ENV = {
  PAYMONGO_SECRET_KEY: "sk_test_dummy",
};

const TOOL_NAMES = [
  "archive_link",
  "create_checkout",
  "create_customer",
  "create_link",
  "create_payment",
  "create_payment_intent",
  "create_payment_method",
  "create_refund",
  "create_source",
  "create_webhook",
  "get_checkout",
  "get_customer",
  "get_link",
  "get_payment_intent",
  "get_payment_method",
  "get_refund",
  "get_source",
  "get_webhook",
  "list_customers",
  "list_payments",
  "list_refunds",
  "list_webhooks",
  "update_webhook",
  "verify_webhook_signature",
];

describe("PayMongo MCP E2E Smoke Test", () => {
  it("starts and lists 24 tools", async () => {
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
