import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");
const TOOL_COUNT = 63;

// Подставные значения — сервер только поднимается, наружу не ходит.
const ENV = {
  KAITEN_DOMAIN: "test",
  KAITEN_TOKEN: "test",
};

const TOOL_NAMES = [
  "add_card_child",
  "add_card_external_link",
  "add_card_member",
  "add_card_tag",
  "add_checklist_item",
  "add_comment",
  "block_card",
  "create_board",
  "create_card",
  "create_checklist",
  "create_column",
  "create_lane",
  "create_space",
  "delete_board",
  "delete_card",
  "delete_column",
  "delete_comment",
  "delete_lane",
  "delete_space",
  "get_board",
  "get_card",
  "get_card_location_history",
  "get_checklist",
  "get_current_user",
  "get_custom_property",
  "get_space",
  "get_sprint_summary",
  "list_boards",
  "list_card_blockers",
  "list_card_children",
  "list_card_external_links",
  "list_card_members",
  "list_card_tags",
  "list_card_types",
  "list_cards",
  "list_columns",
  "list_comments",
  "list_custom_properties",
  "list_custom_property_select_values",
  "list_lanes",
  "list_spaces",
  "list_sprints",
  "list_tags",
  "list_users",
  "move_card",
  "remove_card_child",
  "remove_card_external_link",
  "remove_card_member",
  "remove_card_tag",
  "remove_checklist",
  "remove_checklist_item",
  "unblock_card",
  "update_board",
  "update_card",
  "update_card_blocker",
  "update_card_external_link",
  "update_card_member_role",
  "update_checklist",
  "update_checklist_item",
  "update_column",
  "update_comment",
  "update_lane",
  "update_space",
];

describe("Kaiten MCP E2E Smoke Test", () => {
  it("starts and lists 63 tools", async () => {
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
