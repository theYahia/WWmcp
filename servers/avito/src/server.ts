/**
 * Avito MCP server factory.
 * Split from index.ts so tests can import without triggering runServer.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
import {
  listMyItemsSchema,
  handleListMyItems,
} from "./tools/list-my-items.js";
import {
  getItemInfoSchema,
  handleGetItemInfo,
} from "./tools/get-item-info.js";
import { listChatsSchema, handleListChats } from "./tools/list-chats.js";
import { sendMessageSchema, handleSendMessage } from "./tools/send-message.js";
import {
  getChatMessagesSchema,
  handleGetChatMessages,
} from "./tools/get-chat-messages.js";
import {
  markChatReadSchema,
  handleMarkChatRead,
} from "./tools/mark-chat-read.js";
import {
  getItemsStatsSchema,
  handleGetItemsStats,
} from "./tools/get-items-stats.js";
import {
  getAccountBalanceSchema,
  handleGetAccountBalance,
} from "./tools/get-account-balance.js";

export const logger = createLogger("avito-mcp");

// v0.2.0 — 3 items tools + 4 messenger tools + 1 balance/stats tool = 8 total.
export const TOOL_COUNT = 8;

export function createServer(): McpServer {
  const server = new McpServer({
    name: "avito-mcp",
    version: "0.2.0",
  });

  // ---- Items (3) ----
  server.tool(
    "list_my_items",
    "Список ваших объявлений на Avito с пагинацией. Опциональные фильтры: status (active/old/blocked/rejected/removed) и category (числовой ID категории Avito).",
    listMyItemsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListMyItems(params) }],
    })),
  );

  server.tool(
    "get_item_info",
    "Полная информация по объявлению Avito по item_id (статус, активные платные услуги, базовая статистика). user_id берётся из env AVITO_USER_ID если не передан.",
    getItemInfoSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetItemInfo(params) }],
    })),
  );

  server.tool(
    "get_items_stats",
    "Статистика по объявлениям Avito (просмотры, контакты, добавления в избранное) за период. Принимает массив item_ids (до 200), date_from/date_to в YYYY-MM-DD и группировку по day/week/month.",
    getItemsStatsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetItemsStats(params) }],
    })),
  );

  // ---- Messenger (4) ----
  server.tool(
    "list_chats",
    "Список чатов мессенджера Avito с пагинацией. Фильтры: unread_only (только непрочитанные), item_ids (только по конкретным объявлениям). user_id из env AVITO_USER_ID если не передан.",
    listChatsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListChats(params) }],
    })),
  );

  server.tool(
    "get_chat_messages",
    "История сообщений конкретного чата Avito Messenger (v3 endpoint) с пагинацией. Возвращает сообщения от новых к старым.",
    getChatMessagesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetChatMessages(params) }],
    })),
  );

  server.tool(
    "send_message",
    "Отправить текстовое сообщение покупателю в чат Avito Messenger. text — до 1000 символов. chat_id берётся из list_chats.",
    sendMessageSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSendMessage(params) }],
    })),
  );

  server.tool(
    "mark_chat_read",
    "Отметить чат Avito Messenger как прочитанный. Используется чтобы убрать unread-bage после ответа.",
    markChatReadSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleMarkChatRead(params) }],
    })),
  );

  // ---- Account (1) ----
  server.tool(
    "get_account_balance",
    "Баланс кошелька Avito: реальные деньги (real) + бонусы (bonus). Используется для алертов перед продлением услуг продвижения.",
    getAccountBalanceSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetAccountBalance(params) }],
    })),
  );

  return server;
}
