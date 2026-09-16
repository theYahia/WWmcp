import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");
const TOOL_COUNT = 34;

// Подставные значения — сервер только поднимается, наружу не ходит.
const ENV = {
  "1C_BASE_URL": "https://example.test",
  "1C_LOGIN": "test",
  "1C_PASSWORD": "test",
  ONEC_BASE_URL: "https://example.test",
  ONEC_LOGIN: "test",
  ONEC_PASSWORD: "test",
};

const TOOL_NAMES = [
  "batch_create_documents",
  "batch_query",
  "batch_update_catalog_items",
  "count_entities",
  "create_catalog_item",
  "create_document",
  "delete_document",
  "describe_entity",
  "find_by_description",
  "get_accounting_balance",
  "get_accounting_register",
  "get_accumulation_balance",
  "get_by_key",
  "get_catalogs",
  "get_config_preset",
  "get_constant",
  "get_document_by_number",
  "get_document_lines",
  "get_documents",
  "get_metadata",
  "get_recent_documents",
  "get_register",
  "get_report",
  "list_entities",
  "list_subscriptions",
  "odata_query",
  "poll_changes_since",
  "post_document",
  "set_constant",
  "set_deletion_mark",
  "unpost_document",
  "update_catalog_item",
  "update_document",
  "write_information_register",
];

describe("Aprovodka MCP E2E Smoke Test", () => {
  it("starts and lists 34 tools", async () => {
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
