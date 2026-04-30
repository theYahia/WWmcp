#!/usr/bin/env node

/**
 * @theyahia/vk-ads-mcp — MCP server for VK Ads API
 *
 * 8 tools: list_campaigns, create_campaign, update_campaign, list_ads,
 * create_ad, get_statistics, list_targeting_groups, get_budget.
 *
 * Auth: Bearer token (VK_ADS_TOKEN env var).
 *
 * Transports:
 *   - stdio (default) — for Claude Desktop / Cursor / Windsurf
 *   - Streamable HTTP — --http flag or HTTP_PORT env (port 3000 default)
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, logger } from "./server.js";

runServer(createServer, {
  name: "vk-ads-mcp",
  version: "2.0.0",
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
