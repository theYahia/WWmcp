import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally before importing modules
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Set token so client doesn't throw
process.env.VK_ACCESS_TOKEN = "test-token-123";

import { handleGetWall, handlePostWall, handleSearchPosts } from "../src/tools/wall.js";
import { handleGetUser, handleGetGroups } from "../src/tools/users.js";
import { handleGetFriends } from "../src/tools/friends.js";
import { handleSendMessage } from "../src/tools/messages.js";
import { handleGetStats } from "../src/tools/stats.js";

// GET идёт через BaseHttpClient ядра (читает text()), POST — через свой fetch (json()):
// настоящий Response закрывает оба пути.
function mockVkResponse(data: unknown) {
  mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ response: data }), { status: 200 }));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("wall tools", () => {
  it("get_wall returns formatted JSON", async () => {
    mockVkResponse({ count: 1, items: [{ id: 1, text: "Hello" }] });
    const result = await handleGetWall({ owner_id: -123, count: 20, offset: 0 });
    const parsed = JSON.parse(result);
    expect(parsed.count).toBe(1);
    expect(parsed.items[0].text).toBe("Hello");
    expect(mockFetch).toHaveBeenCalledOnce();
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("wall.get");
    expect(url).toContain("v=5.199");
  });

  it("post_wall sends POST request", async () => {
    mockVkResponse({ post_id: 42 });
    const result = await handlePostWall({
      owner_id: -123,
      message: "Test post",
      from_group: 1,
    });
    const parsed = JSON.parse(result);
    expect(parsed.post_id).toBe(42);
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe("POST");
  });

  it("search_posts passes query params", async () => {
    mockVkResponse({ count: 5, items: [], total_count: 100 });
    const result = await handleSearchPosts({ q: "AI", count: 10 });
    const parsed = JSON.parse(result);
    expect(parsed.count).toBe(5);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("newsfeed.search");
    expect(url).toContain("q=AI");
  });
});

describe("user tools", () => {
  it("get_user fetches user info", async () => {
    mockVkResponse([{ id: 1, first_name: "Pavel", last_name: "Durov" }]);
    const result = await handleGetUser({ user_ids: "1", fields: "photo_200" });
    const parsed = JSON.parse(result);
    expect(parsed[0].first_name).toBe("Pavel");
  });

  it("get_groups fetches group info", async () => {
    mockVkResponse([{ id: 1, name: "VK Team", screen_name: "team" }]);
    const result = await handleGetGroups({ group_ids: "team", fields: "members_count" });
    const parsed = JSON.parse(result);
    expect(parsed[0].name).toBe("VK Team");
  });
});

describe("friends tool", () => {
  it("get_friends returns friends list", async () => {
    mockVkResponse({ count: 2, items: [{ id: 10 }, { id: 20 }] });
    const result = await handleGetFriends({ count: 100, offset: 0, fields: "nickname", order: "hints" });
    const parsed = JSON.parse(result);
    expect(parsed.count).toBe(2);
    expect(parsed.items).toHaveLength(2);
  });
});

describe("messages tool", () => {
  it("send_message sends via POST", async () => {
    mockVkResponse(42);
    const result = await handleSendMessage({ peer_id: 12345, message: "Hello!" });
    expect(JSON.parse(result)).toBe(42);
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe("POST");
  });
});

describe("stats tool", () => {
  it("get_stats fetches group statistics", async () => {
    mockVkResponse([{ day: "2026-03-30", views: 100, visitors: 50 }]);
    const result = await handleGetStats({ group_id: 123, date_from: "2026-03-24", date_to: "2026-03-30" });
    const parsed = JSON.parse(result);
    expect(parsed[0].views).toBe(100);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("stats.get");
  });
});

describe("client error handling", () => {
  it("throws on missing token", async () => {
    const saved = process.env.VK_ACCESS_TOKEN;
    delete process.env.VK_ACCESS_TOKEN;
    await expect(handleGetUser({ user_ids: "1", fields: "" })).rejects.toThrow("VK_ACCESS_TOKEN");
    process.env.VK_ACCESS_TOKEN = saved;
  });

  it("throws on VK API error", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { error_code: 5, error_msg: "Authorization failed" } }), { status: 200 }),
    );
    await expect(handleGetUser({ user_ids: "1", fields: "" })).rejects.toThrow("Authorization failed");
  });

  it("post_wall is not retried on 5xx (no duplicate post)", async () => {
    mockFetch.mockResolvedValueOnce(new Response("", { status: 502, statusText: "Bad Gateway" }));
    await expect(
      handlePostWall({ owner_id: -123, message: "Test post", from_group: 1 }),
    ).rejects.toThrow("Повтор не выполнен");
    expect(mockFetch).toHaveBeenCalledOnce();
  });
});
