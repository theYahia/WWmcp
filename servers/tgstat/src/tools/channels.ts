/**
 * Channel tools: search_channels, get_channel, get_channel_stats,
 * get_channel_mentions, compare_channels.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { apiGet } from "../client.js";
import { success, error, noResults, fromResult } from "../lib/formatters.js";
import { shapeChannel, shapeStat, shapeList, shapeMaybeList, shapePost } from "../lib/shape.js";

const channelId = z.string().min(1).describe("Channel @username, t.me link, or TGStat channel ID");

export function registerChannelTools(server: McpServer): void {
  server.tool(
    "search_channels",
    "Search Telegram channels by query, with optional category / language / country / type filters. Returns curated channel cards.",
    {
      query: z.string().min(1).max(200).describe("Search query"),
      category: z.string().optional().describe("Category code (see list_categories)"),
      language: z.string().optional().describe("Language code, e.g. ru, en (see list_languages)"),
      country: z.string().optional().describe("Country code, e.g. ru, ua, by (see list_countries)"),
      peer_type: z.enum(["channel", "chat", "all"]).default("channel").describe("Source type"),
      search_by_description: z.boolean().default(false).describe("Also match channel descriptions"),
      limit: z.number().int().min(1).max(100).default(20).describe("Max results (max 100)"),
    },
    withErrorHandling(async (params) => {
      const result = await apiGet("/channels/search", {
        q: params.query,
        category: params.category,
        language: params.language,
        country: params.country,
        peer_type: params.peer_type,
        search_by_description: params.search_by_description ? 1 : undefined,
        limit: params.limit,
      });
      if (result.error) return error(result.error);
      const shaped = shapeList(result.data, shapeChannel);
      if (!Array.isArray(shaped.items) || shaped.items.length === 0) {
        return noResults(`No channels found for "${params.query}".`);
      }
      return success(shaped);
    }),
  );

  server.tool(
    "get_channel",
    "Get a Telegram channel's profile: subscribers, category, citation index (ci_index), RKN verification. For reach/ERR use get_channel_stats.",
    { channel_id: channelId },
    withErrorHandling(async (params) =>
      fromResult(await apiGet("/channels/get", { channelId: params.channel_id }), shapeChannel),
    ),
  );

  server.tool(
    "get_channel_stats",
    "Get a channel's statistics: average post reach, ERR%, daily reach, citation index.",
    { channel_id: channelId },
    withErrorHandling(async (params) =>
      fromResult(await apiGet("/channels/stat", { channelId: params.channel_id }), shapeStat),
    ),
  );

  server.tool(
    "get_channel_mentions",
    "Find where a channel is mentioned or forwarded by other channels and chats.",
    {
      channel_id: channelId,
      limit: z.number().int().min(1).max(50).default(50).describe("Max results (max 50)"),
    },
    withErrorHandling(async (params) => {
      const result = await apiGet("/channels/mentions", {
        channelId: params.channel_id,
        limit: params.limit,
      });
      if (result.error) return error(result.error);
      return success(shapeMaybeList(result.data, shapePost));
    }),
  );

  server.tool(
    "compare_channels",
    "Compare several channels side by side on subscribers, average reach and ERR (one channels/stat lookup per channel).",
    {
      channel_ids: z.array(channelId).min(2).max(10).describe("2–10 channel @usernames / IDs to compare"),
    },
    withErrorHandling(async (params) => {
      const settled = await Promise.allSettled(
        params.channel_ids.map((id) => apiGet("/channels/stat", { channelId: id })),
      );
      const channels = settled.map((s, i) => {
        const channel = params.channel_ids[i];
        if (s.status === "rejected") return { channel, ok: false as const, error: String(s.reason) };
        if (s.value.error) return { channel, ok: false as const, error: s.value.error };
        return { channel, ok: true as const, metrics: shapeStat(s.value.data) };
      });
      const subs = (row: (typeof channels)[number]): number => {
        if (!row.ok) return -1;
        const v = (row.metrics as Record<string, unknown>).participants_count;
        return typeof v === "number" ? v : -1;
      };
      channels.sort((a, b) => subs(b) - subs(a));
      return success({ compared: channels.length, channels });
    }),
  );
}
