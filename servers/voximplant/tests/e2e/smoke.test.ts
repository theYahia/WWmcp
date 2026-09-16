import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");
// 21 инструмент + 2 скилла, зарегистрированных как инструменты без параметров.
const TOOL_COUNT = 23;

// Подставные значения — сервер только поднимается, наружу не ходит.
const ENV = {
  VOXIMPLANT_ACCOUNT_ID: "test",
  VOXIMPLANT_API_KEY: "test",
};

const TOOL_NAMES = [
  "get_a2p_sms_history",
  "get_account_info",
  "get_acd_state",
  "get_applications",
  "get_call_history",
  "get_caller_ids",
  "get_phone_numbers",
  "get_queues",
  "get_record_storages",
  "get_recordings",
  "get_rules",
  "get_scenarios",
  "get_skills",
  "get_sms_history",
  "get_sq_state",
  "get_transaction_history",
  "get_users",
  "send_a2p_sms",
  "send_sms",
  "skill-account-info",
  "skill-call-history",
  "start_call",
  "update_scenario",
];

describe("Voximplant MCP E2E Smoke Test", () => {
  it("starts and lists 23 tools", async () => {
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
