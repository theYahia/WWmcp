import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");
const TOOL_COUNT = 8;

// Подставные значения — сервер только поднимается, наружу не ходит.
// ALFA_TLS_* не заданы: сервер стартует в демо-режиме без mTLS.
const ENV = {
  ALFA_CLIENT_ID: "test",
  ALFA_CLIENT_SECRET: "test",
};

const TOOL_NAMES = [
  "create_payment_order",
  "get_account_balance",
  "get_account_statement",
  "get_exchange_rates",
  "get_payment_status",
  "get_salary_registry",
  "list_accounts",
  "list_counterparties",
];

describe("Alfa-Bank MCP E2E Smoke Test", () => {
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
