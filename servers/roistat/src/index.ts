#!/usr/bin/env node

/**
 * @theyahia/roistat-mcp — MCP server for Roistat marketing analytics
 *
 * 6 tools: get_analytics, get_visits, get_leads, get_channels,
 * get_costs, get_integrations. Plus 2 MCP prompts (skills).
 *
 * Auth: ROISTAT_API_KEY + ROISTAT_PROJECT_ID.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import { z } from "zod";
import { getAnalyticsSchema, handleGetAnalytics } from "./tools/analytics.js";
import { getVisitsSchema, handleGetVisits } from "./tools/visits.js";
import { getLeadsSchema, handleGetLeads } from "./tools/leads.js";
import { getChannelsSchema, handleGetChannels } from "./tools/channels.js";
import { getCostsSchema, handleGetCosts } from "./tools/costs.js";
import { getIntegrationsSchema, handleGetIntegrations } from "./tools/integrations.js";

const VERSION = "1.1.1";
const TOOL_COUNT = 6;

const logger = createLogger("roistat-mcp");

function createServer(): McpServer {
  const server = new McpServer({ name: "roistat-mcp", version: VERSION });

  // --- Tools (6) ---

  server.tool(
    "get_analytics",
    "Получение аналитики Roistat по источникам трафика за период. Метрики: визиты, заявки, выручка, ROI.",
    getAnalyticsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetAnalytics(params) }],
    })),
  );

  server.tool(
    "get_visits",
    "Список визитов на сайт из Roistat за период с источниками и UTM-метками.",
    getVisitsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetVisits(params) }],
    })),
  );

  server.tool(
    "get_leads",
    "Получение списка лидов (заявок) из Roistat за период с фильтрацией по статусам.",
    getLeadsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetLeads(params) }],
    })),
  );

  server.tool(
    "get_channels",
    "Эффективность рекламных каналов: визиты, заявки, выручка, затраты, ROI по каждому каналу.",
    getChannelsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetChannels(params) }],
    })),
  );

  server.tool(
    "get_costs",
    "Затраты на рекламу по каналам с группировкой по дням/неделям/месяцам.",
    getCostsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetCosts(params) }],
    })),
  );

  server.tool(
    "get_integrations",
    "Список подключённых интеграций проекта Roistat (CRM, аналитика, рекламные кабинеты).",
    getIntegrationsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetIntegrations(params) }],
    })),
  );

  // --- Skills (2) ---

  server.prompt(
    "skill-analytics",
    "Аналитика за период — запрашивает даты и формирует сводку по ключевым метрикам.",
    {
      from: z.string().describe("Дата начала (YYYY-MM-DD)"),
      to: z.string().describe("Дата конца (YYYY-MM-DD)"),
    },
    async ({ from, to }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Используй инструмент get_analytics с параметрами from="${from}", to="${to}". Покажи сводку: визиты, заявки, выручка, конверсия. Выдели топ-3 источника по выручке. Формат — таблица.`,
          },
        },
      ],
    }),
  );

  server.prompt(
    "skill-channels",
    "Эффективность рекламных каналов — сравнение ROI, CPL, выручки по каналам за период.",
    {
      from: z.string().describe("Дата начала (YYYY-MM-DD)"),
      to: z.string().describe("Дата конца (YYYY-MM-DD)"),
    },
    async ({ from, to }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Используй инструмент get_channels с параметрами from="${from}", to="${to}". Сравни каналы по ROI и выручке. Отметь убыточные каналы. Дай рекомендации по перераспределению бюджета. Формат — таблица + выводы.`,
          },
        },
      ],
    }),
  );

  return server;
}

runServer(createServer, {
  name: "roistat-mcp",
  version: VERSION,
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
