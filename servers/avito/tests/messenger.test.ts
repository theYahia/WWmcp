import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleSendMessage } from "../src/tools/send-message.js";
import { handleGetChatMessages } from "../src/tools/get-chat-messages.js";
import { handleMarkChatRead } from "../src/tools/mark-chat-read.js";
import { handleGetItemsStats } from "../src/tools/get-items-stats.js";
import { handleGetAccountBalance } from "../src/tools/get-account-balance.js";

/**
 * Two-layer fetch mock: first returns OAuth token, then API payload(s).
 * Optional second arg lets tests inject an API failure (status != 2xx).
 */
function mockFetchWithToken(
  apiPayload: unknown,
  apiStatus: { ok: boolean; status: number } = { ok: true, status: 200 },
): ReturnType<typeof vi.fn> {
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
    ok: apiStatus.ok,
    status: apiStatus.status,
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

describe("avito v0.2.0 messenger + stats + balance tool handlers", () => {
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

  // ---------- send_message ----------
  describe("send_message", () => {
    it("POSTs to /messenger/v1/accounts/{user_id}/chats/{chat_id}/messages with text body", async () => {
      const fetch = mockFetchWithToken({ id: "msg-1", created: 1700000000 });
      const json = JSON.parse(
        await handleSendMessage({ chat_id: "abc123", text: "Привет!" }),
      );
      expect(json.id).toBe("msg-1");

      const apiCall = fetch.mock.calls.find(([url]) =>
        String(url).includes("/messenger/v1/accounts/"),
      );
      expect(apiCall).toBeDefined();
      const [url, opts] = apiCall!;
      expect(url).toContain("/messenger/v1/accounts/999/chats/abc123/messages");
      expect(opts.method).toBe("POST");
      const body = JSON.parse(opts.body);
      expect(body).toEqual({ message: { text: "Привет!" }, type: "text" });
    });

    it("uses explicit user_id over env", async () => {
      const fetch = mockFetchWithToken({ id: "msg-2" });
      await handleSendMessage({
        chat_id: "x",
        text: "hi",
        user_id: 4242,
      });
      const apiCall = fetch.mock.calls.find(([url]) =>
        String(url).includes("/messenger/v1/accounts/"),
      );
      expect(apiCall![0]).toContain("/messenger/v1/accounts/4242/chats/x/messages");
    });

    it("URL-encodes chat_id with special characters", async () => {
      const fetch = mockFetchWithToken({ id: "ok" });
      await handleSendMessage({
        chat_id: "u2i:1/2",
        text: "hi",
      });
      const apiCall = fetch.mock.calls.find(([url]) =>
        String(url).includes("/messenger/v1/accounts/"),
      );
      expect(apiCall![0]).toContain("u2i%3A1%2F2");
    });

    it("propagates API error from server (4xx)", async () => {
      mockFetchWithToken(
        { error: { code: 403, message: "Forbidden" } },
        { ok: false, status: 403 },
      );
      await expect(
        handleSendMessage({ chat_id: "x", text: "spam" }),
      ).rejects.toThrow();
    });

    it("rejects empty text via zod schema", async () => {
      mockFetchWithToken({});
      // schema is enforced at the MCP boundary; here we call the handler
      // directly so we sanity-check our own contract by invoking validation.
      const { sendMessageSchema } = await import("../src/tools/send-message.js");
      const result = sendMessageSchema.safeParse({ chat_id: "x", text: "" });
      expect(result.success).toBe(false);
    });
  });

  // ---------- get_chat_messages ----------
  describe("get_chat_messages", () => {
    it("GETs /messenger/v3 path with default limit + offset", async () => {
      const fetch = mockFetchWithToken({
        messages: [
          { id: "m1", content: { text: "hi" } },
          { id: "m2", content: { text: "bye" } },
        ],
      });
      const json = JSON.parse(
        await handleGetChatMessages({
          chat_id: "abc",
          limit: 50,
          offset: 0,
        }),
      );
      expect(json.messages.length).toBe(2);

      const apiCall = fetch.mock.calls.find(([url]) =>
        String(url).includes("/messenger/v3/accounts/"),
      );
      expect(apiCall).toBeDefined();
      expect(apiCall![0]).toContain(
        "/messenger/v3/accounts/999/chats/abc/messages/",
      );
      expect(apiCall![0]).toContain("limit=50");
      expect(apiCall![0]).toContain("offset=0");
    });

    it("passes custom limit + offset for pagination", async () => {
      const fetch = mockFetchWithToken({ messages: [] });
      await handleGetChatMessages({
        chat_id: "abc",
        limit: 25,
        offset: 75,
      });
      const apiCall = fetch.mock.calls.find(([url]) =>
        String(url).includes("/messenger/v3/accounts/"),
      );
      expect(apiCall![0]).toContain("limit=25");
      expect(apiCall![0]).toContain("offset=75");
    });

    it("uses explicit user_id over env", async () => {
      const fetch = mockFetchWithToken({ messages: [] });
      await handleGetChatMessages({
        chat_id: "z",
        user_id: 7,
        limit: 50,
        offset: 0,
      });
      const apiCall = fetch.mock.calls.find(([url]) =>
        String(url).includes("/messenger/v3/accounts/"),
      );
      expect(apiCall![0]).toContain("/messenger/v3/accounts/7/chats/z/messages/");
    });

    it("propagates API error (5xx)", async () => {
      mockFetchWithToken(
        { error: { code: 500, message: "Internal" } },
        { ok: false, status: 500 },
      );
      await expect(
        handleGetChatMessages({ chat_id: "x", limit: 50, offset: 0 }),
      ).rejects.toThrow();
    });
  });

  // ---------- mark_chat_read ----------
  describe("mark_chat_read", () => {
    it("POSTs to /messenger/v1/accounts/{user_id}/chats/{chat_id}/read with empty body", async () => {
      const fetch = mockFetchWithToken({ ok: true });
      const json = JSON.parse(await handleMarkChatRead({ chat_id: "abc" }));
      expect(json.ok).toBe(true);

      const apiCall = fetch.mock.calls.find(([url]) =>
        String(url).includes("/chats/abc/read"),
      );
      expect(apiCall).toBeDefined();
      const [url, opts] = apiCall!;
      expect(url).toContain("/messenger/v1/accounts/999/chats/abc/read");
      expect(opts.method).toBe("POST");
      expect(opts.body).toBe(JSON.stringify({}));
    });

    it("uses explicit user_id over env", async () => {
      const fetch = mockFetchWithToken({ ok: true });
      await handleMarkChatRead({ chat_id: "c", user_id: 33 });
      const apiCall = fetch.mock.calls.find(([url]) =>
        String(url).includes("/chats/c/read"),
      );
      expect(apiCall![0]).toContain("/messenger/v1/accounts/33/chats/c/read");
    });

    it("URL-encodes chat_id", async () => {
      const fetch = mockFetchWithToken({ ok: true });
      await handleMarkChatRead({ chat_id: "u2i:42" });
      const apiCall = fetch.mock.calls.find(([url]) =>
        String(url).includes("/read"),
      );
      expect(apiCall![0]).toContain("u2i%3A42");
    });

    it("propagates auth error from a fresh client when env missing", async () => {
      // The module-level `client` in mark-chat-read may have been initialized
      // by an earlier happy-path test in this suite (with env vars set). Auth
      // error happens at HTTP client build time, not handler-call time — so
      // to assert this contract we exercise it via a freshly-constructed
      // AvitoClient that has not yet been initialized.
      delete process.env["AVITO_CLIENT_ID"];
      delete process.env["AVITO_CLIENT_SECRET"];
      const { AvitoClient } = await import("../src/client.js");
      const fresh = new AvitoClient();
      await expect(
        fresh.request(
          "POST",
          `/messenger/v1/accounts/999/chats/x/read`,
          {},
        ),
      ).rejects.toThrow(/Avito auth not configured/);
    });
  });

  // ---------- get_items_stats ----------
  describe("get_items_stats", () => {
    it("POSTs /stats/v1/accounts/{user_id}/items with item_ids + date window", async () => {
      const fetch = mockFetchWithToken({
        result: { items: [{ itemId: 1, stats: [] }] },
      });
      const json = JSON.parse(
        await handleGetItemsStats({
          item_ids: [1, 2, 3],
          date_from: "2026-05-01",
          date_to: "2026-05-19",
          fields: ["uniqViews", "uniqContacts", "uniqFavorites"],
          period_grouping: "day",
        }),
      );
      expect(json.result.items[0].itemId).toBe(1);

      const apiCall = fetch.mock.calls.find(([url]) =>
        String(url).includes("/stats/v1/accounts/"),
      );
      expect(apiCall).toBeDefined();
      const [url, opts] = apiCall!;
      expect(url).toContain("/stats/v1/accounts/999/items");
      expect(opts.method).toBe("POST");
      const body = JSON.parse(opts.body);
      expect(body.itemIds).toEqual([1, 2, 3]);
      expect(body.dateFrom).toBe("2026-05-01");
      expect(body.dateTo).toBe("2026-05-19");
      expect(body.periodGrouping).toBe("day");
      expect(body.fields).toContain("uniqViews");
    });

    it("uses explicit user_id over env", async () => {
      const fetch = mockFetchWithToken({ result: { items: [] } });
      await handleGetItemsStats({
        item_ids: [1],
        date_from: "2026-05-01",
        date_to: "2026-05-19",
        fields: ["uniqViews", "uniqContacts", "uniqFavorites"],
        period_grouping: "week",
        user_id: 88,
      });
      const apiCall = fetch.mock.calls.find(([url]) =>
        String(url).includes("/stats/v1/accounts/"),
      );
      expect(apiCall![0]).toContain("/stats/v1/accounts/88/items");
    });

    it("rejects invalid date format via schema", async () => {
      const { getItemsStatsSchema } = await import(
        "../src/tools/get-items-stats.js"
      );
      const bad = getItemsStatsSchema.safeParse({
        item_ids: [1],
        date_from: "01.05.2026",
        date_to: "2026-05-19",
      });
      expect(bad.success).toBe(false);
    });

    it("propagates API error (429 rate limit)", async () => {
      mockFetchWithToken(
        { error: { code: 429, message: "Too Many Requests" } },
        { ok: false, status: 429 },
      );
      await expect(
        handleGetItemsStats({
          item_ids: [1],
          date_from: "2026-05-01",
          date_to: "2026-05-19",
          fields: ["uniqViews", "uniqContacts", "uniqFavorites"],
          period_grouping: "day",
        }),
      ).rejects.toThrow();
    });
  });

  // ---------- get_account_balance ----------
  describe("get_account_balance", () => {
    it("GETs /core/v1/accounts/{user_id}/balance/ using env user_id", async () => {
      const fetch = mockFetchWithToken({ real: 1500.5, bonus: 250 });
      const json = JSON.parse(await handleGetAccountBalance({}));
      expect(json.real).toBe(1500.5);
      expect(json.bonus).toBe(250);

      const apiCall = fetch.mock.calls.find(([url]) =>
        String(url).includes("/balance/"),
      );
      expect(apiCall).toBeDefined();
      expect(apiCall![0]).toContain("/core/v1/accounts/999/balance/");
    });

    it("uses explicit user_id over env", async () => {
      const fetch = mockFetchWithToken({ real: 0, bonus: 0 });
      await handleGetAccountBalance({ user_id: 5555 });
      const apiCall = fetch.mock.calls.find(([url]) =>
        String(url).includes("/balance/"),
      );
      expect(apiCall![0]).toContain("/core/v1/accounts/5555/balance/");
    });

    it("throws clear error when user_id is missing entirely", async () => {
      delete process.env["AVITO_USER_ID"];
      mockFetchWithToken({});
      await expect(handleGetAccountBalance({})).rejects.toThrow(
        /user_id is required/,
      );
    });

    it("propagates API error (401 invalid token)", async () => {
      mockFetchWithToken(
        { error: { code: 401, message: "Unauthorized" } },
        { ok: false, status: 401 },
      );
      await expect(handleGetAccountBalance({})).rejects.toThrow();
    });
  });
});
