import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");
const TOOL_COUNT = 7;

// Подставные значения — сервер только поднимается, наружу не ходит
// (токен запрашивается лениво, при первом вызове инструмента).
const ENV = {
  TOCHKA_CLIENT_ID: "test",
  TOCHKA_CLIENT_SECRET: "test",
};

const TOOL_NAMES = [
  "create_payment",
  "get_account_balance",
  "get_company_info",
  "get_payment_status",
  "get_statement",
  "list_accounts",
  "list_customers",
];

describe("Tochka Bank MCP E2E Smoke Test", () => {
  it("starts and lists 7 tools", async () => {
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
