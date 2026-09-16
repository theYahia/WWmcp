/**
 * Keyword tools: track a word's mentions over time, and break them down by the
 * channels that mention it most.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { apiGet } from "../client.js";
import { fromResult } from "../lib/formatters.js";
import { shapeHistory } from "../lib/shape.js";
import { toUnix } from "../lib/dates.js";
import { optionalDate as dateOpt } from "../lib/schemas.js";

const peerType = z.enum(["channel", "chat", "all"]).default("all").describe("Source type");

export function registerWordTools(server: McpServer): void {
  server.tool(
    "get_word_mentions",
    "Track how often a keyword is mentioned across Telegram over time (mentions + views per period).",
    {
      query: z.string().min(1).max(500).describe("Keyword / phrase to track"),
      peer_type: peerType,
      group: z.enum(["day", "week", "month"]).default("day").describe("Grouping period"),
      start_date: dateOpt("Range start (YYYY-MM-DD)"),
      end_date: dateOpt("Range end (YYYY-MM-DD)"),
      hide_forwards: z.boolean().default(false).describe("Exclude reposts"),
      minus_words: z.string().optional().describe("Comma-separated words to exclude"),
      strong_search: z.boolean().default(false).describe("Strict phrase match"),
    },
    withErrorHandling(async (params) =>
      fromResult(
        await apiGet("/words/mentions-by-period", {
          q: params.query,
          peerType: params.peer_type,
          group: params.group,
          startDate: toUnix(params.start_date),
          endDate: toUnix(params.end_date, true),
          hideForwards: params.hide_forwards ? 1 : undefined,
          minusWords: params.minus_words,
          strongSearch: params.strong_search ? 1 : undefined,
        }),
        shapeHistory,
      ),
    ),
  );

  server.tool(
    "get_word_mentions_by_channels",
    "Break down keyword mentions by the channels that mention it most (channel + mention/view counts).",
    {
      query: z.string().min(1).max(500).describe("Keyword / phrase to track"),
      peer_type: peerType,
      start_date: dateOpt("Range start (YYYY-MM-DD)"),
      end_date: dateOpt("Range end (YYYY-MM-DD)"),
      hide_forwards: z.boolean().default(false).describe("Exclude reposts"),
      minus_words: z.string().optional().describe("Comma-separated words to exclude"),
      strong_search: z.boolean().default(false).describe("Strict phrase match"),
      limit: z.number().int().min(1).max(50).default(50).describe("Max channels (max 50)"),
    },
    withErrorHandling(async (params) =>
      // Items pair a channel object with mention/view counts — pass through raw
      // so the counts are preserved alongside the channel.
      fromResult(
        await apiGet("/words/mentions-by-channels", {
          q: params.query,
          peerType: params.peer_type,
          startDate: toUnix(params.start_date),
          endDate: toUnix(params.end_date, true),
          hideForwards: params.hide_forwards ? 1 : undefined,
          minusWords: params.minus_words,
          strongSearch: params.strong_search ? 1 : undefined,
          limit: params.limit,
        }),
      ),
    ),
  );
}
