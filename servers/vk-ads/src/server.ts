/**
 * VK Ads MCP server factory.
 * Split from index.ts so tests can import without triggering runServer.
 *
 * Модель VK Ads v2: ad_plans → ad_groups → banners. Имена инструментов оставлены
 * дружелюбными (list_campaigns / list_ads), но бьют в реальные ресурсы.
 */

import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
import {
  listCampaignsSchema, handleListCampaigns,
  createCampaignSchema, handleCreateCampaign,
  updateCampaignSchema, handleUpdateCampaign,
} from "./tools/ad_plans.js";
import { listAdGroupsSchema, handleListAdGroups } from "./tools/ad_groups.js";
import { listAdsSchema, handleListAds, createAdSchema, handleCreateAd } from "./tools/banners.js";
import { getStatisticsSchema, handleGetStatistics } from "./tools/statistics.js";
import { getAccountSchema, handleGetAccount } from "./tools/account.js";

export const logger = createLogger("vk-ads-mcp");

export const TOOL_COUNT = 8;

/** Single source of truth for the advertised version — no hardcoded drift. */
export const VERSION = (
  JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
    version: string;
  }
).version;

// Конверты outputSchema (raw shape). Значения z.any() — структура items/result остаётся гибкой
// (точные поля ответа VK Ads частично неподтверждены), но конверт даёт клиенту типизированную форму.
const LIST_OUTPUT = { count: z.number().optional(), truncated: z.boolean().optional(), items: z.array(z.any()) };
const STATS_OUTPUT = { items: z.array(z.any()), total: z.any().optional() };
const ACCOUNT_OUTPUT = { account: z.any() };

const READ_ANNOTATIONS = { readOnlyHint: true, openWorldHint: true };
const CREATE_ANNOTATIONS = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true };
const UPDATE_ANNOTATIONS = { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true };

/** Текстовый блок (backwards-compat) + structuredContent для read-инструментов с outputSchema. */
function result(data: Record<string, unknown>, structured: boolean): CallToolResult {
  const content = [{ type: "text" as const, text: JSON.stringify(data, null, 2) }];
  return structured ? { content, structuredContent: data } : { content };
}

export function createServer(): McpServer {
  const server = new McpServer({ name: "vk-ads-mcp", version: VERSION });

  // ─── Кампании (ad_plans) ───

  server.registerTool(
    "list_campaigns",
    {
      title: "Список кампаний",
      description: "Список рекламных кампаний (ad_plans) VK Ads с фильтром по статусу. Авто-пагинация.",
      inputSchema: listCampaignsSchema.shape,
      outputSchema: LIST_OUTPUT,
      annotations: READ_ANNOTATIONS,
    },
    withErrorHandling(async (args) => result(await handleListCampaigns(args), true)),
  );

  server.registerTool(
    "create_campaign",
    {
      title: "Создать кампанию",
      description: "Создать кампанию (ad_plan) VK Ads: название, цель (objective), бюджет (валюта кабинета).",
      inputSchema: createCampaignSchema.shape,
      annotations: CREATE_ANNOTATIONS,
    },
    withErrorHandling(async (args) => result(await handleCreateCampaign(args), false)),
  );

  server.registerTool(
    "update_campaign",
    {
      title: "Обновить кампанию",
      description: "Обновить кампанию (ad_plan): название, бюджет, жизненный цикл (activate/stop/delete).",
      inputSchema: updateCampaignSchema.shape,
      annotations: UPDATE_ANNOTATIONS,
    },
    withErrorHandling(async (args) => result(await handleUpdateCampaign(args), false)),
  );

  // ─── Группы объявлений (ad_groups) ───

  server.registerTool(
    "list_ad_groups",
    {
      title: "Список групп объявлений",
      description: "Группы объявлений (ad_groups) VK Ads с их таргетингом/доставкой. Фильтр по кампаниям. Авто-пагинация.",
      inputSchema: listAdGroupsSchema.shape,
      outputSchema: LIST_OUTPUT,
      annotations: READ_ANNOTATIONS,
    },
    withErrorHandling(async (args) => result(await handleListAdGroups(args), true)),
  );

  // ─── Объявления (banners) ───

  server.registerTool(
    "list_ads",
    {
      title: "Список объявлений",
      description: "Объявления (banners) VK Ads. Фильтр по группам объявлений (ad_group). Авто-пагинация.",
      inputSchema: listAdsSchema.shape,
      outputSchema: LIST_OUTPUT,
      annotations: READ_ANNOTATIONS,
    },
    withErrorHandling(async (args) => result(await handleListAds(args), true)),
  );

  server.registerTool(
    "create_ad",
    {
      title: "Создать объявление",
      description: "Создать объявление (banner) VK Ads в группе (ad_group): textblocks, urls, content (медиа-id).",
      inputSchema: createAdSchema.shape,
      annotations: CREATE_ANNOTATIONS,
    },
    withErrorHandling(async (args) => result(await handleCreateAd(args), false)),
  );

  // ─── Статистика ───

  server.registerTool(
    "get_statistics",
    {
      title: "Статистика",
      description: "Статистика VK Ads: показы (shows), клики, расход за период. object_type/period — в пути URL.",
      inputSchema: getStatisticsSchema.shape,
      outputSchema: STATS_OUTPUT,
      annotations: READ_ANNOTATIONS,
    },
    withErrorHandling(async (args) => result(await handleGetStatistics(args), true)),
  );

  // ─── Кабинет / баланс ───

  server.registerTool(
    "get_account",
    {
      title: "Кабинет и баланс",
      description: "Информация о рекламном кабинете и баланс (через /user.json, нужен scope read_payments).",
      inputSchema: getAccountSchema.shape,
      outputSchema: ACCOUNT_OUTPUT,
      annotations: READ_ANNOTATIONS,
    },
    withErrorHandling(async (args) => result(await handleGetAccount(args), true)),
  );

  return server;
}
