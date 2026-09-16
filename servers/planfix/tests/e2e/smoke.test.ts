import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");
const TOOL_COUNT = 20;

// Подставные значения — сервер только поднимается, наружу не ходит.
const ENV = {
  PLANFIX_ACCOUNT: "test",
  PLANFIX_API_KEY: "test",
  PLANFIX_HOST: "example.test",
  PLANFIX_TOKEN: "test",
};

const TOOL_NAMES = [
  "add_comment",
  "create_contact",
  "create_task",
  "get_comments",
  "get_contact",
  "get_contacts",
  "get_file",
  "get_project",
  "get_projects",
  "get_task",
  "get_tasks",
  "get_user",
  "list_custom_fields",
  "list_datatags",
  "list_directories",
  "list_directory_entries",
  "list_users",
  "update_contact",
  "update_task",
  "upload_file_from_url",
];

describe("Planfix MCP E2E Smoke Test", () => {
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
