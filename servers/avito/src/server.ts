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

export const logger = createLogger("avito-mcp");

// v0.1.0 ships with 3 tools; 5 more planned for v0.2.0 (Day 27-28).
export const TOOL_COUNT = 3;

export function createServer(): McpServer {
  const server = new McpServer({
    name: "avito-mcp",
    version: "0.1.0",
  });

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
    "list_chats",
    "Список чатов мессенджера Avito с пагинацией. Фильтры: unread_only (только непрочитанные), item_ids (только по конкретным объявлениям). user_id из env AVITO_USER_ID если не передан.",
    listChatsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListChats(params) }],
    })),
  );

  return server;
}
