import { describe, it, expect, vi, beforeEach } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerChannelTools } from "../tools/channels.js";
import { registerPostTools } from "../tools/posts.js";
import { registerMetricTools } from "../tools/metrics.js";
import { registerWordTools } from "../tools/words.js";
import { registerDatabaseTools } from "../tools/database.js";
import { registerUsageTools } from "../tools/usage.js";
import { toUnix } from "../lib/dates.js";
import { optionalDate } from "../lib/schemas.js";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);
process.env.TGSTAT_TOKEN = "test-token";

type ToolResult = { content: { text: string }[]; isError?: boolean };
type ToolCb = (params: Record<string, unknown>) => Promise<ToolResult>;

/** Capture the callbacks a register function wires up, so handlers can be invoked directly. */
function collect(register: (server: McpServer) => void): Map<string, ToolCb> {
  const tools = new Map<string, ToolCb>();
  const fake = {
    tool: (name: string, _desc: string, _schema: unknown, cb: ToolCb) => tools.set(name, cb),
  };
  register(fake as unknown as McpServer);
  return tools;
}

const channels = collect(registerChannelTools);
const posts = collect(registerPostTools);
const metrics = collect(registerMetricTools);
const words = collect(registerWordTools);
const database = collect(registerDatabaseTools);
const usage = collect(registerUsageTools);

function ok(response: unknown) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    json: () => Promise.resolve({ status: "ok", response }),
  };
}
function envErr(message: string) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    json: () => Promise.resolve({ status: "error", error: message }),
  };
}
function lastUrl(): string {
  return mockFetch.mock.calls.at(-1)![0] as string;
}
function parse(res: ToolResult): any {
  return JSON.parse(res.content[0].text);
}
function unix(date: string): number {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / 1000);
}

beforeEach(() => mockFetch.mockReset());

describe("registration", () => {
  it("registers 20 tools across all groups", () => {
    expect(channels.size + posts.size + metrics.size + words.size + database.size + usage.size).toBe(20);
  });
});

describe("search_channels", () => {
  it("maps params, shapes results, drops noisy fields", async () => {
    mockFetch.mockResolvedValueOnce(
      ok({ count: 1, items: [{ id: "1", username: "tech", title: "Tech", participants_count: 5000, image640: "noise" }] }),
    );
    const res = await channels.get("search_channels")!({
      query: "tech",
      peer_type: "channel",
      search_by_description: false,
      limit: 20,
    });
    const data = parse(res);
    expect(data.items).toHaveLength(1);
    expect(data.items[0].title).toBe("Tech");
    expect(data.items[0].image640).toBeUndefined();
    const url = lastUrl();
    expect(url).toContain("/channels/search");
    expect(url).toContain("q=tech");
    expect(url).toContain("peer_type=channel");
    expect(url).toContain("limit=20");
  });

  it("returns no_results on empty", async () => {
    mockFetch.mockResolvedValueOnce(ok({ count: 0, items: [] }));
    const res = await channels.get("search_channels")!({
      query: "zzz",
      peer_type: "channel",
      search_by_description: false,
      limit: 20,
    });
    expect(parse(res).status).toBe("no_results");
  });

  it("passes the language filter", async () => {
    mockFetch.mockResolvedValueOnce(ok({ items: [{ id: "1" }] }));
    await channels.get("search_channels")!({
      query: "маркетинг",
      language: "ru",
      peer_type: "channel",
      search_by_description: false,
      limit: 20,
    });
    expect(lastUrl()).toContain("language=ru");
  });
});

describe("get_channel", () => {
  it("shapes the channel and uses channelId", async () => {
    mockFetch.mockResolvedValueOnce(
      ok({ id: "456", username: "x", title: "Ch", participants_count: 10000, image100: "noise" }),
    );
    const res = await channels.get("get_channel")!({ channel_id: "@x" });
    const data = parse(res);
    expect(data.participants_count).toBe(10000);
    expect(data.image100).toBeUndefined();
    expect(lastUrl()).toContain("channelId=%40x");
  });

  it("propagates a logical API error as isError", async () => {
    mockFetch.mockResolvedValueOnce(envErr("invalid channel"));
    const res = await channels.get("get_channel")!({ channel_id: "@bad" });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain("invalid channel");
  });
});

describe("compare_channels", () => {
  it("uses /channels/stat per channel and sorts by subscribers", async () => {
    mockFetch.mockResolvedValueOnce(ok({ id: "1", participants_count: 1000, err_percent: 10 }));
    mockFetch.mockResolvedValueOnce(ok({ id: "2", participants_count: 3000, err_percent: 20 }));
    const res = await channels.get("compare_channels")!({ channel_ids: ["@a", "@b"] });
    const data = parse(res);
    expect(data.channels).toHaveLength(2);
    expect(data.channels[0].channel).toBe("@b"); // sorted desc by participants
    expect(data.channels[0].metrics.participants_count).toBe(3000);
    for (const call of mockFetch.mock.calls) expect(call[0]).toContain("/channels/stat");
  });
});

describe("get_channel_mentions", () => {
  it("tolerates a list-shaped response", async () => {
    mockFetch.mockResolvedValueOnce(ok({ items: [{ id: "1/2", views: 5, text: "hi" }] }));
    const res = await channels.get("get_channel_mentions")!({ channel_id: "@x", limit: 50 });
    expect(parse(res).items).toHaveLength(1);
    expect(lastUrl()).toContain("/channels/mentions");
  });
});

describe("search_posts (bug fixes)", () => {
  it("converts dates to unix and drops the removed `channels` param", async () => {
    mockFetch.mockResolvedValueOnce(ok({ count: 0, items: [] }));
    await posts.get("search_posts")!({
      query: "AI",
      peer_type: "all",
      hide_forwards: false,
      extended: false,
      limit: 20,
      date_from: "2026-01-01",
      date_to: "2026-01-31",
    });
    const url = lastUrl();
    expect(url).toContain(`startDate=${unix("2026-01-01")}`);
    expect(url).not.toContain("startDate=2026-01-01"); // not the raw YYYY-MM-DD
    expect(url).not.toContain("channels=");
    expect(url).toContain("peerType=all");
    expect(url).toContain("/posts/search");
  });
});

describe("get_channel_posts", () => {
  it("sends startTime as unix and shapes/truncates posts", async () => {
    mockFetch.mockResolvedValueOnce(
      ok({ count: 1, total_count: 1, items: [{ id: "1/100", views: 5000, text: "x".repeat(400), date: 1767225600 }] }),
    );
    const res = await posts.get("get_channel_posts")!({
      channel_id: "@t",
      limit: 10,
      offset: 0,
      hide_forwards: false,
      extended: false,
      start_date: "2026-01-01",
    });
    const data = parse(res);
    expect(data.items).toHaveLength(1);
    expect((data.items[0].text as string).length).toBeLessThanOrEqual(281); // truncated to 280 + ellipsis
    expect(typeof data.items[0].date).toBe("string"); // unix → ISO
    const url = lastUrl();
    expect(url).toContain("limit=10");
    expect(url).toContain(`startTime=${unix("2026-01-01")}`);
  });
});

describe("get_post", () => {
  it("shapes the post and uses postId", async () => {
    mockFetch.mockResolvedValueOnce(ok({ id: "123/456", views: 10000, forwards: 50, date: 1767225600 }));
    const res = await posts.get("get_post")!({ post_id: "123/456" });
    const data = parse(res);
    expect(data.views).toBe(10000);
    expect(data.forwards).toBe(50);
    expect(lastUrl()).toContain("postId=123%2F456");
  });
});

describe("metrics", () => {
  it("get_channel_subscribers sends group and unix range", async () => {
    mockFetch.mockResolvedValueOnce(ok([{ period: "2026-01-01", participants_count: 100 }]));
    const res = await metrics.get("get_channel_subscribers")!({
      channel_id: "@x",
      group: "week",
      start_date: "2026-01-01",
    });
    expect(parse(res)).toHaveLength(1);
    const url = lastUrl();
    expect(url).toContain("/channels/subscribers");
    expect(url).toContain("group=week");
    expect(url).toContain(`startDate=${unix("2026-01-01")}`);
  });

  it("get_channel_forwards hits /channels/forwards with a tolerant list", async () => {
    mockFetch.mockResolvedValueOnce(ok({ items: [{ id: "1/2", views: 9 }] }));
    const res = await metrics.get("get_channel_forwards")!({ channel_id: "@x", limit: 50 });
    expect(parse(res).items).toHaveLength(1);
    expect(lastUrl()).toContain("/channels/forwards");
  });
});

describe("words", () => {
  it("get_word_mentions hits words/mentions-by-period with peerType + group", async () => {
    mockFetch.mockResolvedValueOnce(ok([{ period: "2026-01", mentions_count: 10, views_count: 1000 }]));
    const res = await words.get("get_word_mentions")!({
      query: "AI",
      peer_type: "all",
      group: "month",
      hide_forwards: false,
      strong_search: false,
    });
    expect(parse(res)).toHaveLength(1);
    const url = lastUrl();
    expect(url).toContain("/words/mentions-by-period");
    expect(url).toContain("q=AI");
    expect(url).toContain("peerType=all");
    expect(url).toContain("group=month");
  });
});

describe("database", () => {
  it("list_categories sends lang", async () => {
    mockFetch.mockResolvedValueOnce(ok([{ code: "tech", name: "Технологии" }]));
    const res = await database.get("list_categories")!({ lang: "ru" });
    expect(parse(res)[0].code).toBe("tech");
    expect(lastUrl()).toContain("/database/categories");
    expect(lastUrl()).toContain("lang=ru");
  });
});

describe("usage", () => {
  it("get_usage hits usage/stat", async () => {
    mockFetch.mockResolvedValueOnce(ok([{ serviceKey: "api_stat_l", spentRequests: "100/400000" }]));
    const res = await usage.get("get_usage")!({});
    expect(parse(res)[0].serviceKey).toBe("api_stat_l");
    expect(lastUrl()).toContain("/usage/stat");
  });
});

describe("toUnix", () => {
  it("converts YYYY-MM-DD to unix seconds (UTC midnight)", () => {
    expect(toUnix("2026-01-01")).toBe(unix("2026-01-01"));
  });
  it("snaps to end of day with endOfDay=true", () => {
    expect(toUnix("2026-01-01", true)).toBe(Math.floor(Date.parse("2026-01-01T23:59:59Z") / 1000));
  });
  it("returns undefined for undefined input", () => {
    expect(toUnix(undefined)).toBeUndefined();
  });
});

describe("optionalDate schema", () => {
  const schema = optionalDate("test");

  it("accepts a valid date", () => {
    expect(schema.safeParse("2026-01-31").success).toBe(true);
  });
  it("accepts undefined (optional)", () => {
    expect(schema.safeParse(undefined).success).toBe(true);
  });
  it("rejects a wrong format", () => {
    expect(schema.safeParse("31-01-2026").success).toBe(false);
  });
  it("rejects an impossible calendar date (so toUnix never throws at runtime)", () => {
    expect(schema.safeParse("2026-13-01").success).toBe(false);
  });
});
