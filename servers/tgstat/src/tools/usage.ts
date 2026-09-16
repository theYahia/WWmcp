/**
 * Usage tool: API quota and package limits.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { apiGet } from "../client.js";
import { fromResult } from "../lib/formatters.js";

export function registerUsageTools(server: McpServer): void {
  server.tool(
    "get_usage",
    "Show your TGStat API usage and quota: requests / channels / words spent vs allowed, and package expiry.",
    {},
    withErrorHandling(async () => fromResult(await apiGet("/usage/stat"))),
  );
}
