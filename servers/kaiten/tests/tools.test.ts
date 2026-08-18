import { describe, it, expect, vi, beforeEach } from "vitest";
import { allTools } from "../src/index.js";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

process.env.KAITEN_DOMAIN = "testdomain";
process.env.KAITEN_TOKEN = "test-token";

const BASE = "https://testdomain.kaiten.ru/api/latest";

/**
 * One case per tool. Every tool MUST appear here (a guard test fails otherwise),
 * which keeps the request method / path / body of all 63 tools verified against
 * the implementation. `body` (when given) must deep-equal the sent JSON body.
 */
interface Case {
  args: Record<string, unknown>;
  method: string;
  // Path the request URL must start with (after BASE), ignoring the query string.
  path: string;
  body?: unknown;
}

const CASES: Record<string, Case> = {
  // spaces
  list_spaces: { args: {}, method: "GET", path: "/spaces" },
  get_space: { args: { space_id: 1 }, method: "GET", path: "/spaces/1" },
  create_space: { args: { title: "Dev" }, method: "POST", path: "/spaces", body: { title: "Dev" } },
  update_space: { args: { space_id: 1, title: "X" }, method: "PATCH", path: "/spaces/1", body: { title: "X" } },
  delete_space: { args: { space_id: 1 }, method: "DELETE", path: "/spaces/1" },
  // boards
  list_boards: { args: { space_id: 2 }, method: "GET", path: "/spaces/2/boards" },
  get_board: { args: { board_id: 1 }, method: "GET", path: "/boards/1" },
  create_board: { args: { space_id: 2, title: "S" }, method: "POST", path: "/spaces/2/boards", body: { title: "S" } },
  update_board: { args: { space_id: 2, board_id: 9, title: "X" }, method: "PATCH", path: "/spaces/2/boards/9" },
  delete_board: { args: { space_id: 2, board_id: 9 }, method: "DELETE", path: "/spaces/2/boards/9" },
  // columns
  list_columns: { args: { board_id: 5 }, method: "GET", path: "/boards/5/columns" },
  create_column: {
    args: { board_id: 5, title: "Doing", type: 2 },
    method: "POST",
    path: "/boards/5/columns",
    body: { title: "Doing", type: 2 },
  },
  update_column: { args: { board_id: 5, column_id: 6, title: "X" }, method: "PATCH", path: "/boards/5/columns/6" },
  delete_column: { args: { board_id: 5, column_id: 6 }, method: "DELETE", path: "/boards/5/columns/6" },
  // lanes
  list_lanes: { args: { board_id: 5 }, method: "GET", path: "/boards/5/lanes" },
  create_lane: { args: { board_id: 5, title: "A" }, method: "POST", path: "/boards/5/lanes", body: { title: "A" } },
  update_lane: { args: { board_id: 5, lane_id: 7, title: "X" }, method: "PATCH", path: "/boards/5/lanes/7" },
  delete_lane: { args: { board_id: 5, lane_id: 7 }, method: "DELETE", path: "/boards/5/lanes/7" },
  // cards
  list_cards: { args: { board_id: 1, query: "bug" }, method: "GET", path: "/cards" },
  get_card: { args: { card_id: 42 }, method: "GET", path: "/cards/42" },
  create_card: {
    args: { title: "T", board_id: 1, column_id: 2 },
    method: "POST",
    path: "/cards",
    body: { title: "T", board_id: 1, column_id: 2 },
  },
  update_card: { args: { card_id: 10, asap: true }, method: "PATCH", path: "/cards/10", body: { asap: true } },
  move_card: {
    args: { card_id: 10, column_id: 3, lane_id: 4 },
    method: "PATCH",
    path: "/cards/10",
    body: { column_id: 3, lane_id: 4 },
  },
  delete_card: { args: { card_id: 10 }, method: "DELETE", path: "/cards/10" },
  get_card_location_history: { args: { card_id: 10 }, method: "GET", path: "/cards/10/location-history" },
  // comments
  add_comment: { args: { card_id: 1, text: "hi" }, method: "POST", path: "/cards/1/comments", body: { text: "hi" } },
  list_comments: { args: { card_id: 1 }, method: "GET", path: "/cards/1/comments" },
  update_comment: {
    args: { card_id: 1, comment_id: 2, text: "e" },
    method: "PATCH",
    path: "/cards/1/comments/2",
    body: { text: "e" },
  },
  delete_comment: { args: { card_id: 1, comment_id: 2 }, method: "DELETE", path: "/cards/1/comments/2" },
  // members
  list_card_members: { args: { card_id: 1 }, method: "GET", path: "/cards/1/members" },
  add_card_member: { args: { card_id: 1, user_id: 4 }, method: "POST", path: "/cards/1/members", body: { user_id: 4 } },
  update_card_member_role: {
    args: { card_id: 1, user_id: 4, type: 2 },
    method: "PATCH",
    path: "/cards/1/members/4",
    body: { type: 2 },
  },
  remove_card_member: { args: { card_id: 1, user_id: 4 }, method: "DELETE", path: "/cards/1/members/4" },
  // card tags
  list_card_tags: { args: { card_id: 1 }, method: "GET", path: "/cards/1/tags" },
  add_card_tag: {
    args: { card_id: 1, name: "urgent" },
    method: "POST",
    path: "/cards/1/tags",
    body: { name: "urgent" },
  },
  remove_card_tag: { args: { card_id: 1, tag_id: 2 }, method: "DELETE", path: "/cards/1/tags/2" },
  // children
  list_card_children: { args: { card_id: 1 }, method: "GET", path: "/cards/1/children" },
  add_card_child: {
    args: { card_id: 1, child_card_id: 2 },
    method: "POST",
    path: "/cards/1/children",
    body: { card_id: 2 },
  },
  remove_card_child: { args: { card_id: 1, child_card_id: 2 }, method: "DELETE", path: "/cards/1/children/2" },
  // external links
  list_card_external_links: { args: { card_id: 1 }, method: "GET", path: "/cards/1/external-links" },
  add_card_external_link: {
    args: { card_id: 1, url: "https://x.io" },
    method: "POST",
    path: "/cards/1/external-links",
    body: { url: "https://x.io" },
  },
  update_card_external_link: {
    args: { card_id: 1, link_id: 2, url: "https://y.io" },
    method: "PATCH",
    path: "/cards/1/external-links/2",
  },
  remove_card_external_link: { args: { card_id: 1, link_id: 2 }, method: "DELETE", path: "/cards/1/external-links/2" },
  // blockers
  list_card_blockers: { args: { card_id: 1 }, method: "GET", path: "/cards/1/blockers" },
  block_card: { args: { card_id: 1, reason: "w" }, method: "POST", path: "/cards/1/blockers", body: { reason: "w" } },
  update_card_blocker: {
    args: { card_id: 1, blocker_id: 2, reason: "x" },
    method: "PATCH",
    path: "/cards/1/blockers/2",
  },
  unblock_card: { args: { card_id: 1, blocker_id: 2 }, method: "DELETE", path: "/cards/1/blockers/2" },
  // checklists
  create_checklist: {
    args: { card_id: 1, name: "QA" },
    method: "POST",
    path: "/cards/1/checklists",
    body: { name: "QA" },
  },
  get_checklist: { args: { card_id: 1, checklist_id: 2 }, method: "GET", path: "/cards/1/checklists/2" },
  update_checklist: {
    args: { card_id: 1, checklist_id: 2, name: "X" },
    method: "PATCH",
    path: "/cards/1/checklists/2",
  },
  remove_checklist: { args: { card_id: 1, checklist_id: 2 }, method: "DELETE", path: "/cards/1/checklists/2" },
  add_checklist_item: {
    args: { card_id: 1, checklist_id: 2, text: "t" },
    method: "POST",
    path: "/cards/1/checklists/2/items",
    body: { text: "t" },
  },
  update_checklist_item: {
    args: { card_id: 1, checklist_id: 2, item_id: 3, checked: true },
    method: "PATCH",
    path: "/cards/1/checklists/2/items/3",
    body: { checked: true },
  },
  remove_checklist_item: {
    args: { card_id: 1, checklist_id: 2, item_id: 3 },
    method: "DELETE",
    path: "/cards/1/checklists/2/items/3",
  },
  // tags / users
  list_tags: { args: {}, method: "GET", path: "/tags" },
  list_users: { args: {}, method: "GET", path: "/users" },
  get_current_user: { args: {}, method: "GET", path: "/users/current" },
  // read-only advanced
  list_card_types: { args: {}, method: "GET", path: "/card-types" },
  list_sprints: { args: { active: true }, method: "GET", path: "/sprints" },
  get_sprint_summary: { args: { sprint_id: 8 }, method: "GET", path: "/sprints/8" },
  list_custom_properties: { args: {}, method: "GET", path: "/company/custom-properties" },
  get_custom_property: { args: { property_id: 1 }, method: "GET", path: "/company/custom-properties/1" },
  list_custom_property_select_values: {
    args: { property_id: 1 },
    method: "GET",
    path: "/company/custom-properties/1/select-values",
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Headers(),
    text: () => Promise.resolve("[]"),
  });
});

describe("every tool has a verified request shape", () => {
  it("CASES covers every registered tool", () => {
    const missing = allTools.map((t) => t.name).filter((n) => !(n in CASES));
    expect(missing).toEqual([]);
  });

  for (const tool of allTools) {
    it(`${tool.name}: ${CASES[tool.name]?.method} ${CASES[tool.name]?.path}`, async () => {
      const c = CASES[tool.name];
      expect(c, `no test case for ${tool.name}`).toBeDefined();
      await tool.handler(c.args);
      const [url, init] = mockFetch.mock.calls.at(-1)!;
      expect(init.method).toBe(c.method);
      const pathOnly = String(url).slice(BASE.length).split("?")[0];
      expect(pathOnly).toBe(c.path);
      if (c.body !== undefined) {
        expect(JSON.parse(init.body)).toEqual(c.body);
      }
    });
  }
});
