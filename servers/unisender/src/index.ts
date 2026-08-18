#!/usr/bin/env node

/**
 * @theyahia/unisender-mcp — MCP server for UniSender email marketing API
 *
 * 10 tools: lists, contacts, campaigns, templates, statistics.
 * Auth: UNISENDER_API_KEY.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import { getListsSchema, handleGetLists } from "./tools/lists.js";
import { createListSchema, handleCreateList } from "./tools/create-list.js";
import { createEmailSchema, handleCreateEmail } from "./tools/create-email.js";
import { sendEmailSchema, handleSendEmail } from "./tools/send-email.js";
import { getContactsSchema, handleGetContacts } from "./tools/contacts.js";
import { subscribeSchema, handleSubscribe } from "./tools/subscribe.js";
import {
  getCampaignStatsSchema, handleGetCampaignStats,
  getCampaignDeliveryStatsSchema, handleGetCampaignDeliveryStats,
} from "./tools/campaign-stats.js";
import {
  getTemplatesSchema, handleGetTemplates,
  getTemplateSchema, handleGetTemplate,
} from "./tools/templates.js";

const VERSION = "1.1.1";
const TOOL_COUNT = 10;

const logger = createLogger("unisender-mcp");

export function createServer(): McpServer {
  const server = new McpServer({
    name: "unisender-mcp",
    version: VERSION,
  });

  // === Lists ===
  server.tool(
    "get_lists",
    "Списки рассылки UniSender: ID, название, количество подписчиков.",
    getListsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetLists(params) }],
    })),
  );

  server.tool(
    "create_list",
    "Создать новый список рассылки.",
    createListSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateList(params) }],
    })),
  );

  // === Contacts ===
  server.tool(
    "get_contacts",
    "Контакты из списка рассылки: email, статус подписки.",
    getContactsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetContacts(params) }],
    })),
  );

  server.tool(
    "subscribe",
    "Подписать контакт на список(и) рассылки.",
    subscribeSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSubscribe(params) }],
    })),
  );

  // === Campaigns ===
  server.tool(
    "create_email",
    "Создать email-сообщение для рассылки: тема, тело, отправитель.",
    createEmailSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateEmail(params) }],
    })),
  );

  server.tool(
    "send_email",
    "Отправить рассылку по созданному письму.",
    sendEmailSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSendEmail(params) }],
    })),
  );

  server.tool(
    "get_campaign_status",
    "Статус кампании: отправлено, доставлено, открыто, клики.",
    getCampaignStatsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetCampaignStats(params) }],
    })),
  );

  server.tool(
    "get_campaign_delivery_stats",
    "Детальная статистика доставки кампании.",
    getCampaignDeliveryStatsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetCampaignDeliveryStats(params) }],
    })),
  );

  // === Templates ===
  server.tool(
    "get_templates",
    "Список шаблонов писем.",
    getTemplatesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetTemplates(params) }],
    })),
  );

  server.tool(
    "get_template",
    "Получить конкретный шаблон по ID.",
    getTemplateSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetTemplate(params) }],
    })),
  );

  return server;
}

runServer(createServer, {
  name: "unisender-mcp",
  version: VERSION,
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
