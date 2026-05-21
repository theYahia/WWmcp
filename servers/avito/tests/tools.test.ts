import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleListMyItems } from "../src/tools/list-my-items.js";
import { handleGetItemInfo } from "../src/tools/get-item-info.js";
import { handleListChats } from "../src/tools/list-chats.js";

/**
 * Helper: build a fetch mock that always returns a token on the first call
 * (so the OAuth refresh succeeds) then the supplied API payload on every
 * subsequent call.
 */
function mockFetchWithToken(apiPayload: unknown): ReturnType<typeof vi.fn> {
  const tokenResponse = {
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        access_token: "test-access-token",
        expires_in: 86400,
        token_type: "Bearer",
      }),
    text: () =>
      Promise.resolve(
        JSON.stringify({
          access_token: "test-access-token",
          expires_in: 86400,
          token_type: "Bearer",
        }),
      ),
    headers: new Map(),
  };
  const apiResponse = {
    ok: true,
    text: () => Promise.resolve(JSON.stringify(apiPayload)),
    headers: new Map(),
  };
  const mock = vi.fn((url: string) => {
    if (typeof url === "string" && url.includes("/token")) {
      return Promise.resolve(tokenResponse);
    }
    return Promise.resolve(apiResponse);
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

describe("avito tool handlers", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["AVITO_CLIENT_ID"] = "test-client";
    process.env["AVITO_CLIENT_SECRET"] = "test-secret";
    process.env["AVITO_USER_ID"] = "999";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  describe("list_my_items", () => {
    it("GETs /core/v1/items with page + per_page", async () => {
      const fetch = mockFetchWithToken({ resources: [{ id: 1, title: "Item 1" }] });
      const json = JSON.parse(
        await handleListMyItems({ page: 1, per_page: 25 }),
      );
      expect(json.resources[0].title).toBe("Item 1");

      // Find the API call (skip the token call).
      const apiCall = fetch.mock.calls.find(([url]) =>
        String(url).includes("/core/v1/items"),
      );
      expect(apiCall).toBeDefined();
      expect(apiCall![0]).toContain("/core/v1/items");
      expect(apiCall![0]).toContain("page=1");
      expect(apiCall![0]).toContain("per_page=25");
    });

    it("returns empty results gracefully", async () => {
      mockFetchWithToken({ resources: [], meta: { page: 1, per_page: 25 } });
      const json = JSON.parse(
        await handleListMyItems({ page: 1, per_page: 25 }),
      );
      expect(json.resources).toEqual([]);
    });

    it("passes status + category filters when provided", async () => {
      const fetch = mockFetchWithToken({ resources: [] });
      await handleListMyItems({
        page: 2,
        per_page: 50,
        status: "active",
        category: 24,
      });
      const apiCall = fetch.mock.calls.find(([url]) =>
        String(url).includes("/core/v1/items"),
      );
      expect(apiCall![0]).toContain("status=active");
      expect(apiCall![0]).toContain("category=24");
      expect(apiCall![0]).toContain("page=2");
      expect(apiCall![0]).toContain("per_page=50");
    });
  });

  describe("get_item_info", () => {
    it("hits /core/v1/accounts/{user_id}/items/{item_id}/ using env user_id", async () => {
      const fetch = mockFetchWithToken({ id: 42, title: "Bike", status: "active" });
      const json = JSON.parse(await handleGetItemInfo({ item_id: 42 }));
      expect(json.id).toBe(42);
      const apiCall = fetch.mock.calls.find(([url]) =>
        String(url).includes("/items/42/"),
      );
      expect(apiCall).toBeDefined();
      expect(apiCall![0]).toContain("/core/v1/accounts/999/items/42/");
    });

    it("uses explicit user_id over env", async () => {
      const fetch = mockFetchWithToken({ id: 7 });
      await handleGetItemInfo({ item_id: 7, user_id: 1234 });
      const apiCall = fetch.mock.calls.find(([url]) =>
        String(url).includes("/items/7/"),
      );
      expect(apiCall![0]).toContain("/core/v1/accounts/1234/items/7/");
    });
  });

  describe("list_chats", () => {
    it("hits /messenger/v2/accounts/{user_id}/chats with limit + offset", async () => {
      const fetch = mockFetchWithToken({ chats: [{ id: "abc", type: "u2i" }] });
      const json = JSON.parse(
        await handleListChats({ limit: 50, offset: 0, unread_only: false }),
      );
      expect(json.chats[0].id).toBe("abc");
      const apiCall = fetch.mock.calls.find(([url]) =>
        String(url).includes("/messenger/v2"),
      );
      expect(apiCall![0]).toContain("/messenger/v2/accounts/999/chats");
      expect(apiCall![0]).toContain("limit=50");
      expect(apiCall![0]).toContain("offset=0");
    });

    it("passes unread_only + item_ids filters when provided", async () => {
      const fetch = mockFetchWithToken({ chats: [] });
      await handleListChats({
        limit: 10,
        offset: 20,
        unread_only: true,
        item_ids: [1, 2, 3],
      });
      const apiCall = fetch.mock.calls.find(([url]) =>
        String(url).includes("/messenger/v2"),
      );
      expect(apiCall![0]).toContain("unread_only=true");
      expect(apiCall![0]).toContain("item_ids=1%2C2%2C3");
    });
  });
});
