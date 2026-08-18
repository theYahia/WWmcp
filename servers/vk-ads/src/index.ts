#!/usr/bin/env node

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { VERSION, assertCredentials } from "./config.js";
import { VkAdsError } from "./errors.js";
import { listCampaignsSchema, handleListCampaigns, createCampaignSchema, handleCreateCampaign, updateCampaignSchema, handleUpdateCampaign } from "./tools/ad_plans.js";
import { listAdGroupsSchema, handleListAdGroups } from "./tools/ad_groups.js";
import { listAdsSchema, handleListAds, createAdSchema, handleCreateAd } from "./tools/banners.js";
import { getStatisticsSchema, handleGetStatistics } from "./tools/statistics.js";
import { getAccountSchema, handleGetAccount } from "./tools/account.js";

type TextContent = { type: "text"; text: string };
type ToolResult = { content: TextContent[]; structuredContent?: Record<string, unknown>; isError?: boolean };

/** Успешный результат: текстовый блок (backwards-compat) + опц. structuredContent (для read-tools с outputSchema). */
function ok(data: Record<string, unknown>, structured: boolean): ToolResult {
  const content: TextContent[] = [{ type: "text", text: JSON.stringify(data, null, 2) }];
  return structured ? { content, structuredContent: data } : { content };
}

/** Ошибка инструмента: isError:true с понятным текстом — LLM видит и может скорректировать запрос. */
function fail(error: unknown): ToolResult {
  const message =
    error instanceof VkAdsError
      ? `VK Ads [${error.status} ${error.code}]: ${error.message}`
      : error instanceof Error
        ? error.message
        : String(error);
  return { content: [{ type: "text", text: `Ошибка: ${message}` }], isError: true };
}

// Конверты outputSchema (raw shape). Значения z.any() — структура items/result остаётся гибкой
// (точные поля ответа VK Ads частично неподтверждены), но конверт даёт клиенту типизированную форму.
const LIST_OUTPUT = { count: z.number().optional(), truncated: z.boolean().optional(), items: z.array(z.any()) };
const STATS_OUTPUT = { items: z.array(z.any()), total: z.any().optional() };
const ACCOUNT_OUTPUT = { account: z.any() };

const READ_ANNOTATIONS = { readOnlyHint: true, openWorldHint: true };
const CREATE_ANNOTATIONS = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true };
const UPDATE_ANNOTATIONS = { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true };

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
  async (args) => {
    try {
      return ok(await handleListCampaigns(args), true);
    } catch (error) {
      return fail(error);
    }
  },
);

server.registerTool(
  "create_campaign",
  {
    title: "Создать кампанию",
    description: "Создать кампанию (ad_plan) VK Ads: название, цель (objective), бюджет (валюта кабинета).",
    inputSchema: createCampaignSchema.shape,
    annotations: CREATE_ANNOTATIONS,
  },
  async (args) => {
    try {
      return ok(await handleCreateCampaign(args), false);
    } catch (error) {
      return fail(error);
    }
  },
);

server.registerTool(
  "update_campaign",
  {
    title: "Обновить кампанию",
    description: "Обновить кампанию (ad_plan): название, бюджет, жизненный цикл (activate/stop/delete).",
    inputSchema: updateCampaignSchema.shape,
    annotations: UPDATE_ANNOTATIONS,
  },
  async (args) => {
    try {
      return ok(await handleUpdateCampaign(args), false);
    } catch (error) {
      return fail(error);
    }
  },
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
  async (args) => {
    try {
      return ok(await handleListAdGroups(args), true);
    } catch (error) {
      return fail(error);
    }
  },
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
  async (args) => {
    try {
      return ok(await handleListAds(args), true);
    } catch (error) {
      return fail(error);
    }
  },
);

server.registerTool(
  "create_ad",
  {
    title: "Создать объявление",
    description: "Создать объявление (banner) VK Ads в группе (ad_group): textblocks, urls, content (медиа-id).",
    inputSchema: createAdSchema.shape,
    annotations: CREATE_ANNOTATIONS,
  },
  async (args) => {
    try {
      return ok(await handleCreateAd(args), false);
    } catch (error) {
      return fail(error);
    }
  },
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
  async (args) => {
    try {
      return ok(await handleGetStatistics(args), true);
    } catch (error) {
      return fail(error);
    }
  },
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
  async (args) => {
    try {
      return ok(await handleGetAccount(args), true);
    } catch (error) {
      return fail(error);
    }
  },
);

async function main() {
  assertCredentials();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[vk-ads-mcp] v${VERSION} запущен. 8 инструментов. Требуется VK_ADS_TOKEN.`);
}

main().catch((error) => {
  console.error("[vk-ads-mcp] Ошибка запуска:", error);
  process.exit(1);
});
