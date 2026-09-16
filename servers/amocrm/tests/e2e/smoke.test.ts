import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");
const TOOL_COUNT = 19;

// Подставные значения — сервер только поднимается, наружу не ходит.
const ENV = {
  AMOCRM_ACCESS_TOKEN: "test",
  AMOCRM_CLIENT_ID: "test",
  AMOCRM_CLIENT_SECRET: "test",
  AMOCRM_DOMAIN: "example.test",
  AMOCRM_REFRESH_TOKEN: "test",
  AMOCRM_SUBDOMAIN: "test",
};

const TOOL_NAMES = [
  "accept_unsorted",
  "add_note",
  "complete_task",
  "create_company",
  "create_contact",
  "create_lead",
  "create_task",
  "get_account",
  "get_contact",
  "get_lead",
  "list_companies",
  "list_contacts",
  "list_events",
  "list_leads",
  "list_pipelines",
  "list_tasks",
  "list_unsorted",
  "search",
  "update_lead",
];

describe("Amocrm MCP E2E Smoke Test", () => {
  it("starts and lists 19 tools", async () => {
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
