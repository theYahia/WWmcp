/**
 * Post tools: get_channel_posts, get_post, search_posts, get_post_stats.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { apiGet } from "../client.js";
import { success, error, noResults, fromResult } from "../lib/formatters.js";
import { shapePost, shapeList } from "../lib/shape.js";
import { toUnix } from "../lib/dates.js";
import { optionalDate } from "../lib/schemas.js";

const dateField = optionalDate;

const postId = z.string().min(1).describe("Post ID in channelId/messageId form, e.g. 123/456");

const isEmptyList = (shaped: Record<string, unknown>): boolean =>
  !Array.isArray(shaped.items) || shaped.items.length === 0;

export function registerPostTools(server: McpServer): void {
  server.tool(
    "get_channel_posts",
    "Get recent posts of a channel with view metrics. Supports an optional date range and pagination.",
    {
      channel_id: z.string().min(1).describe("Channel @username / t.me link / TGStat ID"),
      limit: z.number().int().min(1).max(50).default(20).describe("Posts to return (max 50)"),
      offset: z.number().int().min(0).max(1000).default(0).describe("Pagination offset (max 1000)"),
      start_date: dateField("Only posts on/after this date (YYYY-MM-DD)"),
      end_date: dateField("Only posts on/before this date (YYYY-MM-DD)"),
      hide_forwards: z.boolean().default(false).describe("Exclude reposts"),
      extended: z.boolean().default(false).describe("Include the channel object in the response"),
    },
    withErrorHandling(async (params) => {
      const result = await apiGet("/channels/posts", {
        channelId: params.channel_id,
        limit: params.limit,
        offset: params.offset,
        startTime: toUnix(params.start_date),
        endTime: toUnix(params.end_date, true),
        hideForwards: params.hide_forwards ? 1 : undefined,
        extended: params.extended ? 1 : undefined,
      });
      if (result.error) return error(result.error);
      const shaped = shapeList(result.data, shapePost);
      if (isEmptyList(shaped)) {
        return noResults(`No posts found for ${params.channel_id}.`);
      }
      return success(shaped);
    }),
  );

  server.tool(
    "get_post",
    "Get details of a single post: views, forwards, reactions, text.",
    { post_id: postId },
    withErrorHandling(async (params) =>
      fromResult(await apiGet("/posts/get", { postId: params.post_id }), shapePost),
    ),
  );

  server.tool(
    "search_posts",
    "Full-text search across Telegram posts, with optional source-type / category / language / country / date filters.",
    {
      query: z.string().min(1).max(500).describe("Search query"),
      peer_type: z.enum(["channel", "chat", "all"]).default("all").describe("Source type"),
      category: z.string().optional().describe("Channel category code (see list_categories)"),
      language: z.string().optional().describe("Channel language code (see list_languages)"),
      country: z.string().optional().describe("Channel country code (see list_countries)"),
      date_from: dateField("Posts on/after this date (YYYY-MM-DD)"),
      date_to: dateField("Posts on/before this date (YYYY-MM-DD)"),
      hide_forwards: z.boolean().default(false).describe("Exclude reposts"),
      minus_words: z.string().optional().describe("Comma-separated words to exclude"),
      extended: z.boolean().default(false).describe("Include channel objects"),
      limit: z.number().int().min(1).max(50).default(20).describe("Max results (max 50)"),
    },
    withErrorHandling(async (params) => {
      const result = await apiGet("/posts/search", {
        q: params.query,
        peerType: params.peer_type,
        category: params.category,
        language: params.language,
        country: params.country,
        startDate: toUnix(params.date_from),
        endDate: toUnix(params.date_to, true),
        hideForwards: params.hide_forwards ? 1 : undefined,
        minusWords: params.minus_words,
        extended: params.extended ? 1 : undefined,
        limit: params.limit,
      });
      if (result.error) return error(result.error);
      const shaped = shapeList(result.data, shapePost);
      if (isEmptyList(shaped)) {
        return noResults(`No posts found for "${params.query}".`);
      }
      return success(shaped);
    }),
  );

  server.tool(
    "get_post_stats",
    "Get a post's engagement dynamics: views, forwards and reactions over time.",
    { post_id: postId },
    withErrorHandling(async (params) => fromResult(await apiGet("/posts/stat", { postId: params.post_id }))),
  );
}
