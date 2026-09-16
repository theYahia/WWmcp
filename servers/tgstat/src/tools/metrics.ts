/**
 * Time-series metric tools (history): subscribers, views, average post reach,
 * ERR, plus the list of posts that forwarded a channel.
 *
 * The four history endpoints share one parameter shape (channelId + date range
 * + grouping), so they are generated from a single helper.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { apiGet, type Param } from "../client.js";
import { success, error, fromResult } from "../lib/formatters.js";
import { shapeHistory, shapeMaybeList, shapePost } from "../lib/shape.js";
import { toUnix } from "../lib/dates.js";
import { optionalDate as dateOpt } from "../lib/schemas.js";

const channelId = z.string().min(1).describe("Channel @username / t.me link / TGStat ID");

const historyShape = {
  channel_id: channelId,
  start_date: dateOpt("Range start (YYYY-MM-DD)"),
  end_date: dateOpt("Range end (YYYY-MM-DD)"),
  group: z.enum(["hour", "day", "week", "month"]).default("day").describe("Grouping period"),
};

type HistoryParams = {
  channel_id: string;
  start_date?: string;
  end_date?: string;
  group: "hour" | "day" | "week" | "month";
};

function historyQuery(p: HistoryParams): Record<string, Param> {
  return {
    channelId: p.channel_id,
    startDate: toUnix(p.start_date),
    endDate: toUnix(p.end_date, true),
    group: p.group,
  };
}

export function registerMetricTools(server: McpServer): void {
  const history = (name: string, path: string, description: string) =>
    server.tool(
      name,
      description,
      historyShape,
      withErrorHandling(async (params: HistoryParams) =>
        fromResult(await apiGet(path, historyQuery(params)), shapeHistory),
      ),
    );

  history(
    "get_channel_subscribers",
    "/channels/subscribers",
    "Subscriber-count history of a channel over time.",
  );
  history(
    "get_channel_views",
    "/channels/views",
    "Total post-views history of a channel over time.",
  );
  history(
    "get_channel_avg_reach",
    "/channels/avg-posts-reach",
    "Average post-reach history of a channel over time.",
  );
  history(
    "get_channel_err",
    "/channels/err",
    "ERR (engagement rate by reach) history of a channel over time.",
  );

  server.tool(
    "get_channel_forwards",
    "Posts from other channels that forwarded this channel's content.",
    {
      channel_id: channelId,
      limit: z.number().int().min(1).max(50).default(50).describe("Max results (max 50)"),
      start_date: dateOpt("Range start (YYYY-MM-DD)"),
      end_date: dateOpt("Range end (YYYY-MM-DD)"),
    },
    withErrorHandling(async (params) => {
      const result = await apiGet("/channels/forwards", {
        channelId: params.channel_id,
        limit: params.limit,
        startDate: toUnix(params.start_date),
        endDate: toUnix(params.end_date, true),
      });
      if (result.error) return error(result.error);
      return success(shapeMaybeList(result.data, shapePost));
    }),
  );
}
