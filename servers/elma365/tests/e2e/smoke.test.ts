import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "../../../../packages/core/dist/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");
const TOOL_COUNT = 20;

// Подставные значения — сервер только поднимается, наружу не ходит.
const ENV = {
  ELMA365_BASE_URL: "https://example.test",
  ELMA365_DOMAIN: "example.test",
  ELMA365_TOKEN: "test",
};

const TOOL_NAMES = [
  "add_comment",
  "complete_task",
  "create_item",
  "get_app_item",
  "get_app_items",
  "get_app_schema",
  "get_comments",
  "get_process_instances",
  "get_task",
  "get_task_exits",
  "get_tasks",
  "get_user_by_id",
  "get_users",
  "list_apps",
  "list_namespaces",
  "list_processes",
  "reassign_task",
  "set_app_item_status",
  "start_process",
  "update_app_item",
];

describe("Elma365 MCP E2E Smoke Test", () => {
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
