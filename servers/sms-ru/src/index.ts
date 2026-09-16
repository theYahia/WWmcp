#!/usr/bin/env node

/**
 * @theyahia/sms-ru-mcp — MCP server for the SMS.RU API (Russia)
 *
 * 5 tools: send_sms, check_status, get_balance, get_cost, get_senders.
 * Auth: SMS_RU_API_ID.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import {
  sendSmsSchema, handleSendSms,
  checkStatusSchema, handleCheckStatus,
  getBalanceSchema, handleGetBalance,
  getCostSchema, handleGetCost,
  getSendersSchema, handleGetSenders,
} from "./tools/sms.js";

const VERSION = "1.1.1";
const logger = createLogger("sms-ru-mcp");

export function createServer(): McpServer {
  const server = new McpServer({
    name: "sms-ru-mcp",
    version: VERSION,
  });

  server.tool(
    "send_sms",
    "Отправить SMS через SMS.RU. Принимает номер (79XXXXXXXXX), текст, опционально имя отправителя.",
    sendSmsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSendSms(params) }],
    })),
  );

  server.tool(
    "check_status",
    "Проверить статус отправленного SMS по его ID.",
    checkStatusSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCheckStatus(params) }],
    })),
  );

  server.tool(
    "get_balance",
    "Проверить баланс аккаунта SMS.RU.",
    getBalanceSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetBalance(params) }],
    })),
  );

  server.tool(
    "get_cost",
    "Рассчитать стоимость SMS до отправки. Принимает номер и текст сообщения.",
    getCostSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetCost(params) }],
    })),
  );

  server.tool(
    "get_senders",
    "Получить список одобренных имён отправителей на аккаунте SMS.RU.",
    getSendersSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetSenders(params) }],
    })),
  );

  return server;
}

// ponytail: v1.1 в режиме --http слушал PORT (по умолчанию 8080), ядро читает HTTP_PORT
// (по умолчанию 3000) — пробрасываем, чтобы не сломать опубликованный в README контракт.
if (process.argv.includes("--http") && !process.env["HTTP_PORT"]) {
  process.env["HTTP_PORT"] = process.env["PORT"] ?? "8080";
}

runServer(createServer, {
  name: "sms-ru-mcp",
  version: VERSION,
  toolCount: 5,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
