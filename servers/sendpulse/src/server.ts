/**
 * SendPulse MCP server factory.
 *
 * 11 tools: get_mailing_lists, send_email, list_campaigns, get_campaign_statistics,
 * list_templates, get_template, smtp_send_email, smtp_list_emails,
 * list_push_websites, get_push_statistics, create_push_task.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";

import { getMailingListsSchema, handleGetMailingLists } from "./tools/mailing-lists.js";
import { sendEmailSchema, handleSendEmail } from "./tools/send-email.js";
import { getStatisticsSchema, handleGetStatistics } from "./tools/statistics.js";
import { listCampaignsSchema, handleListCampaigns } from "./tools/campaigns.js";
import { listTemplatesSchema, handleListTemplates, getTemplateSchema, handleGetTemplate } from "./tools/templates.js";
import { smtpSendSchema, handleSmtpSend, smtpListEmailsSchema, handleSmtpListEmails } from "./tools/smtp.js";
import { listPushWebsitesSchema, handleListPushWebsites, getPushStatisticsSchema, handleGetPushStatistics, createPushTaskSchema, handleCreatePushTask } from "./tools/push.js";

export const logger = createLogger("sendpulse-mcp");

export const VERSION = "1.1.1";

export const TOOL_COUNT = 11;

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "sendpulse-mcp",
    version: VERSION,
  });

  // --- Mailing Lists ---
  server.tool(
    "get_mailing_lists",
    "Списки рассылки SendPulse: ID, название, количество подписчиков.",
    getMailingListsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetMailingLists(params) }],
    })),
  );

  // --- Campaigns ---
  server.tool(
    "send_email",
    "Создать и отправить email-кампанию по списку рассылки.",
    sendEmailSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSendEmail(params) }],
    })),
  );

  server.tool(
    "list_campaigns",
    "Список email-кампаний с пагинацией.",
    listCampaignsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListCampaigns(params) }],
    })),
  );

  server.tool(
    "get_campaign_statistics",
    "Статистика кампании: отправлено, открыто, кликов, open rate, click rate.",
    getStatisticsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetStatistics(params) }],
    })),
  );

  // --- Templates ---
  server.tool(
    "list_templates",
    "Список email-шаблонов (свои или системные SendPulse).",
    listTemplatesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListTemplates(params) }],
    })),
  );

  server.tool(
    "get_template",
    "Получить детали email-шаблона по ID.",
    getTemplateSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetTemplate(params) }],
    })),
  );

  // --- SMTP ---
  server.tool(
    "smtp_send_email",
    "Отправить транзакционное email через SMTP сервис SendPulse.",
    smtpSendSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSmtpSend(params) }],
    })),
  );

  server.tool(
    "smtp_list_emails",
    "Список отправленных SMTP-писем с пагинацией.",
    smtpListEmailsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSmtpListEmails(params) }],
    })),
  );

  // --- Push Notifications ---
  server.tool(
    "list_push_websites",
    "Список сайтов с push-подпиской.",
    listPushWebsitesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListPushWebsites(params) }],
    })),
  );

  server.tool(
    "get_push_statistics",
    "Статистика push-уведомлений для сайта.",
    getPushStatisticsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetPushStatistics(params) }],
    })),
  );

  server.tool(
    "create_push_task",
    "Создать push-уведомление для сайта.",
    createPushTaskSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreatePushTask(params) }],
    })),
  );

  return server;
}
