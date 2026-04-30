/**
 * VK Ads MCP server factory.
 * Split from index.ts so tests can import without triggering runServer.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
import {
  listCampaignsSchema, handleListCampaigns,
  createCampaignSchema, handleCreateCampaign,
  updateCampaignSchema, handleUpdateCampaign,
} from "./tools/campaigns.js";
import {
  listAdsSchema, handleListAds,
  createAdSchema, handleCreateAd,
} from "./tools/ads.js";
import { getStatisticsSchema, handleGetStatistics } from "./tools/statistics.js";
import { listTargetingGroupsSchema, handleListTargetingGroups } from "./tools/targeting.js";
import { getBudgetSchema, handleGetBudget } from "./tools/budget.js";

export const logger = createLogger("vk-ads-mcp");

export const TOOL_COUNT = 8;

export function createServer(): McpServer {
  const server = new McpServer({
    name: "vk-ads-mcp",
    version: "2.0.0",
  });

  server.tool(
    "list_campaigns",
    "List VK Ads campaigns in an account, with optional filter by status (active/blocked/deleted).",
    listCampaignsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListCampaigns(params) }],
    })),
  );

  server.tool(
    "create_campaign",
    "Create a new VK Ads campaign with name, type, and budget (in kopecks).",
    createCampaignSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateCampaign(params) }],
    })),
  );

  server.tool(
    "update_campaign",
    "Update a VK Ads campaign — change name, budget, or status (start/stop).",
    updateCampaignSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleUpdateCampaign(params) }],
    })),
  );

  server.tool(
    "list_ads",
    "List ads inside one or more VK Ads campaigns. Returns ad format, status, and content data.",
    listAdsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListAds(params) }],
    })),
  );

  server.tool(
    "create_ad",
    "Create a VK Ads ad — text/image/video format with title, description, and link URL.",
    createAdSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateAd(params) }],
    })),
  );

  server.tool(
    "get_statistics",
    "Get VK Ads statistics — impressions, clicks, spend over a date range, grouped by day/week/month.",
    getStatisticsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetStatistics(params) }],
    })),
  );

  server.tool(
    "list_targeting_groups",
    "List targeting groups for a VK Ads campaign — audiences, demographics, interests.",
    listTargetingGroupsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListTargetingGroups(params) }],
    })),
  );

  server.tool(
    "get_budget",
    "Get the VK Ads account budget — remaining balance and spending limits.",
    getBudgetSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetBudget(params) }],
    })),
  );

  return server;
}
