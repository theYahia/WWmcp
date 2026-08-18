/**
 * Server factory.
 *
 * Split out of index.ts so tests can import createServer without triggering
 * the side-effect runServer() call that index.ts performs on direct execution.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
import {
  getCallsSchema, handleGetCalls,
  getUsersSchema, handleGetUsers,
  makeCallSchema, handleMakeCall,
  getStatsSchema, handleGetStats,
  getRecordingSchema, handleGetRecording,
  sendSmsSchema, handleSendSms,
} from "./tools/calls.js";
import { skillCallHistory, skillStats } from "./skills/index.js";

export const VERSION = "1.1.1";
export const TOOL_COUNT = 8;

export const logger = createLogger("mango-office-mcp");

export function createServer(): McpServer {
  const server = new McpServer({
    name: "mango-office-mcp",
    version: VERSION,
  });

  // --- Tools (6) ---

  server.tool(
    "get_calls",
    "Получить историю звонков Mango Office за период.",
    getCallsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetCalls(params) }],
    })),
  );

  server.tool(
    "get_users",
    "Получить список пользователей Mango Office.",
    getUsersSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetUsers(params) }],
    })),
  );

  server.tool(
    "make_call",
    "Инициировать исходящий звонок (callback) через Mango Office.",
    makeCallSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleMakeCall(params) }],
    })),
  );

  server.tool(
    "get_stats",
    "Получить сводную статистику звонков за период.",
    getStatsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetStats(params) }],
    })),
  );

  server.tool(
    "get_recording",
    "Получить ссылку на запись разговора.",
    getRecordingSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetRecording(params) }],
    })),
  );

  server.tool(
    "send_sms",
    "Отправить SMS через Mango Office.",
    sendSmsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSendSms(params) }],
    })),
  );

  // --- Skills (2) ---

  server.tool(
    "skill_call_history",
    "История звонков за сегодня — готовый отчёт.",
    {},
    withErrorHandling(async () => ({
      content: [{ type: "text", text: await skillCallHistory() }],
    })),
  );

  server.tool(
    "skill_stats",
    "Статистика звонков за сегодня — сводка.",
    {},
    withErrorHandling(async () => ({
      content: [{ type: "text", text: await skillStats() }],
    })),
  );

  return server;
}
