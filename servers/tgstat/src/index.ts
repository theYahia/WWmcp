#!/usr/bin/env node

/**
 * @theyahia/tgstat-mcp — MCP server for the TGStat API (Telegram analytics, RU).
 *
 * 20 tools across channels, posts, time-series metrics, keyword trends,
 * reference data, and API usage.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT).
 *
 * Security:
 *   - stdout is reserved for the JSON-RPC transport — all logs go to stderr.
 *   - TGSTAT_TOKEN is read from env and never logged or returned in errors.
 *   - Every tool validates its input with Zod; every request has a hard timeout.
 *   - Every tool result passes mcp-core withErrorHandling (sanitize + truncate).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer } from "@theyahia/mcp-core";

import { registerChannelTools } from "./tools/channels.js";
import { registerPostTools } from "./tools/posts.js";
import { registerMetricTools } from "./tools/metrics.js";
import { registerWordTools } from "./tools/words.js";
import { registerDatabaseTools } from "./tools/database.js";
import { registerUsageTools } from "./tools/usage.js";

const VERSION = "2.0.0";

const logger = createLogger("tgstat-mcp");

function createServer(): McpServer {
  const server = new McpServer({ name: "tgstat-mcp", version: VERSION });

  registerChannelTools(server);  // search_channels, get_channel, get_channel_stats, get_channel_mentions, compare_channels
  registerPostTools(server);     // get_channel_posts, get_post, search_posts, get_post_stats
  registerMetricTools(server);   // get_channel_subscribers, get_channel_views, get_channel_avg_reach, get_channel_err, get_channel_forwards
  registerWordTools(server);     // get_word_mentions, get_word_mentions_by_channels
  registerDatabaseTools(server); // list_categories, list_countries, list_languages
  registerUsageTools(server);    // get_usage

  return server;
}

runServer(createServer, {
  name: "tgstat-mcp",
  version: VERSION,
  toolCount: 20,
  logger,
}).catch((error) => {
  logger.error("Fatal startup error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
