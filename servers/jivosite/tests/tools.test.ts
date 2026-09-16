import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally before any imports
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

process.env.JIVOSITE_TOKEN = "test-token-123";

import { jivoGet, jivoPost, jivoDelete } from "../src/client.js";
import { handleGetChats } from "../src/tools/chats.js";
import { handleGetAgents } from "../src/tools/agents.js";
import { handleGetContacts, handleCreateContact } from "../src/tools/contacts.js";
import { handleGetMessages, handleSendMessage } from "../src/tools/messages.js";
import { handleGetWebhooks, handleCreateWebhook, handleDeleteWebhook } from "../src/tools/webhooks.js";
import { skillActiveChats } from "../src/skills/active-chats.js";
import { skillAgentStats } from "../src/skills/agent-stats.js";

beforeEach(() => {
  mockFetch.mockReset();
});

function mockOk(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => data,
    text: async () => JSON.stringify(data),
  });
}

// core's BaseHttpClient reads the error body and response headers before throwing.
function mockError(status: number) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    statusText: `Error ${status}`,
    text: async () => "",
    headers: new Headers(),
  });
}

describe("client", () => {
  it("jivoGet sends correct auth header", async () => {
    mockOk({ data: [] });
    await jivoGet("chats", { limit: "10" });
    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/chats?limit=10");
    expect(new Headers(opts.headers).get("Authorization")).toBe("Bearer test-token-123");
  });

  it("jivoPost sends body", async () => {
    mockOk({ id: "123" });
    await jivoPost("contacts", { name: "Test" });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({ name: "Test" });
  });

  it("jivoDelete sends DELETE method", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => "" });
    const result = await jivoDelete("webhooks/123");
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/webhooks/123");
    expect(opts.method).toBe("DELETE");
    expect(result).toEqual({ success: true });
  });
});

describe("tools/chats", () => {
  it("handleGetChats returns JSON string", async () => {
    const mockData = { data: [{ chat_id: "1", status: "active" }] };
    mockOk(mockData);
    const result = await handleGetChats({ limit: 10, offset: 0 });
    const parsed = JSON.parse(result);
    expect(parsed.data).toHaveLength(1);
    expect(parsed.data[0].chat_id).toBe("1");
  });

  it("handleGetChats passes status filter", async () => {
    mockOk({ data: [] });
    await handleGetChats({ limit: 10, offset: 0, status: "active" });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("status=active");
  });
});

describe("tools/agents", () => {
  it("handleGetAgents returns agents", async () => {
    mockOk({ data: [{ agent_id: "a1", name: "Op1" }] });
    const result = await handleGetAgents({ limit: 50 });
    const parsed = JSON.parse(result);
    expect(parsed.data[0].name).toBe("Op1");
  });
});

describe("tools/contacts", () => {
  it("handleGetContacts with search query", async () => {
    mockOk({ data: [{ contact_id: "c1", name: "John" }] });
    await handleGetContacts({ limit: 20, offset: 0, query: "John" });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("q=John");
  });

  it("handleCreateContact sends POST", async () => {
    mockOk({ contact_id: "c2", name: "New" });
    const result = await handleCreateContact({ name: "New", email: "t@t.com" });
    const parsed = JSON.parse(result);
    expect(parsed.name).toBe("New");
  });
});

describe("tools/messages", () => {
  it("handleGetMessages uses chat_id in path", async () => {
    mockOk({ data: [{ message_id: "m1", body: "Hello" }] });
    await handleGetMessages({ chat_id: "chat-123", limit: 50, offset: 0 });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/chats/chat-123/messages");
  });

  it("handleSendMessage sends body", async () => {
    mockOk({ message_id: "m2" });
    await handleSendMessage({ chat_id: "chat-123", body: "Hi!", type: "text" });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/chats/chat-123/messages");
    expect(opts.method).toBe("POST");
  });
});

describe("tools/webhooks", () => {
  it("handleGetWebhooks returns webhooks", async () => {
    mockOk({ data: [{ webhook_id: "w1", url: "https://example.com/hook" }] });
    const result = await handleGetWebhooks();
    const parsed = JSON.parse(result);
    expect(parsed.data[0].webhook_id).toBe("w1");
  });

  it("handleCreateWebhook sends POST", async () => {
    mockOk({ webhook_id: "w2" });
    const result = await handleCreateWebhook({ url: "https://example.com/hook", event: "chat_accepted" });
    const parsed = JSON.parse(result);
    expect(parsed.webhook_id).toBe("w2");
  });

  it("handleDeleteWebhook sends DELETE", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => "" });
    const result = await handleDeleteWebhook({ webhook_id: "w1" });
    const parsed = JSON.parse(result);
    expect(parsed.success).toBe(true);
  });
});

describe("skills", () => {
  it("skillActiveChats returns summary", async () => {
    mockOk({ data: [{ chat_id: "1", status: "active", client_name: "Client", agent_id: "op1" }] });
    const result = await skillActiveChats();
    expect(result).toContain("Активные чаты");
    expect(result).toContain("Client");
  });

  it("skillActiveChats handles empty", async () => {
    mockOk({ data: [] });
    const result = await skillActiveChats();
    expect(result).toContain("нет активных чатов");
  });

  it("skillAgentStats returns stats", async () => {
    mockOk({ data: [
      { agent_id: "a1", name: "Op1", status: "online", email: "op1@t.com" },
      { agent_id: "a2", name: "Op2", status: "offline", email: "op2@t.com" },
    ]});
    const result = await skillAgentStats();
    expect(result).toContain("Всего операторов: 2");
    expect(result).toContain("Онлайн: 1");
    expect(result).toContain("[ON]");
    expect(result).toContain("[OFF]");
  });
});

describe("retry logic", () => {
  it("retries on 429", async () => {
    mockError(429);
    mockOk({ ok: true });
    const result = await jivoGet("test");
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ ok: true });
  });

  it("retries on 500", async () => {
    mockError(500);
    mockOk({ ok: true });
    const result = await jivoGet("test");
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ ok: true });
  });

  it("throws on 403", async () => {
    mockError(403);
    await expect(jivoGet("test")).rejects.toThrow("HTTP 403");
  });
});
