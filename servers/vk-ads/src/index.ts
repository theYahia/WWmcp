#!/usr/bin/env node

/**
 * @theyahia/vk-ads-mcp — MCP server for the VK Ads API v2 (ads.vk.com/api/v2)
 *
 * 8 tools: list_campaigns, create_campaign, update_campaign, list_ad_groups,
 * list_ads, create_ad, get_statistics, get_account.
 *
 * Auth: Bearer token (VK_ADS_TOKEN), optionally auto-refreshed via
 * VK_ADS_CLIENT_ID + VK_ADS_CLIENT_SECRET + VK_ADS_REFRESH_TOKEN.
 *
 * Transports:
 *   - stdio (default) — for Claude Desktop / Cursor / Windsurf
 *   - Streamable HTTP — --http flag or HTTP_PORT env (port 3000 default)
 */

import { runServer } from "@theyahia/mcp-core";
import { createServer, TOOL_COUNT, VERSION, logger } from "./server.js";

runServer(createServer, {
  name: "vk-ads-mcp",
  version: VERSION,
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
