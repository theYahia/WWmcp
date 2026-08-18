#!/usr/bin/env node

/**
 * @theyahia/mts-exolve-mcp — MCP server for the MTS Exolve API (Russia)
 *
 * 8 tools: send_sms, get_sms_status, make_call, get_call_status,
 * get_call_recording, list_numbers, buy_number, send_viber_message.
 *
 * Auth: Bearer token (MTS_EXOLVE_TOKEN env var).
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import {
  sendSmsSchema,
  handleSendSms,
  getSmsStatusSchema,
  handleGetSmsStatus,
} from "./tools/sms.js";
import {
  makeCallSchema,
  handleMakeCall,
  getCallStatusSchema,
  handleGetCallStatus,
  getCallRecordingSchema,
  handleGetCallRecording,
} from "./tools/calls.js";
import { handleListNumbers, buyNumberSchema, handleBuyNumber } from "./tools/numbers.js";
import { sendViberMessageSchema, handleSendViberMessage } from "./tools/viber.js";

const VERSION = "3.0.1";
const TOOL_COUNT = 8;

const logger = createLogger("mts-exolve-mcp");

function createServer(): McpServer {
  const server = new McpServer({
    name: "mts-exolve-mcp",
    version: VERSION,
  });

  server.tool(
    "send_sms",
    "Отправить SMS через MTS Exolve. Возвращает message_id — используйте его в get_sms_status для проверки доставки. Требуется MTS_EXOLVE_TOKEN.",
    sendSmsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSendSms(params) }],
    })),
  );

  server.tool(
    "get_sms_status",
    "Проверить статус отправленного SMS по message_id, полученному из send_sms. Возвращает статус доставки и время.",
    getSmsStatusSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetSmsStatus(params) }],
    })),
  );

  server.tool(
    "make_call",
    "Инициировать телефонный звонок через MTS Exolve между двумя номерами. Возвращает call_id для get_call_status и get_call_recording.",
    makeCallSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleMakeCall(params) }],
    })),
  );

  server.tool(
    "get_call_status",
    "Проверить статус звонка по call_id из make_call. Возвращает статус и длительность разговора.",
    getCallStatusSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetCallStatus(params) }],
    })),
  );

  server.tool(
    "get_call_recording",
    "Получить запись звонка по call_id. Возвращает ссылку на аудиофайл записи и её длительность.",
    getCallRecordingSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetCallRecording(params) }],
    })),
  );

  server.tool(
    "list_numbers",
    "Список телефонных номеров, подключённых к аккаунту MTS Exolve: номер, тип, регион и статус. Параметры не требуются.",
    {},
    withErrorHandling(async () => ({
      content: [{ type: "text", text: await handleListNumbers() }],
    })),
  );

  server.tool(
    "buy_number",
    "Купить новый телефонный номер в указанном регионе. Внимание: операция платная и списывает средства с баланса аккаунта.",
    buyNumberSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleBuyNumber(params) }],
    })),
  );

  server.tool(
    "send_viber_message",
    "Отправить сообщение через Viber на номер получателя. Возвращает message_id отправленного сообщения.",
    sendViberMessageSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSendViberMessage(params) }],
    })),
  );

  return server;
}

runServer(createServer, {
  name: "mts-exolve-mcp",
  version: VERSION,
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
