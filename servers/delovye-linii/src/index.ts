#!/usr/bin/env node

/**
 * @theyahia/delovye-linii-mcp — MCP server for Delovye Linii (Dellin) API
 *
 * 6 tools: calculate, get_cities, track, get_terminals,
 * create_order, get_order_history.
 * Auth: DELLIN_API_KEY.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import { calculateSchema, handleCalculate } from "./tools/calculate.js";
import { getCitiesSchema, handleGetCities } from "./tools/cities.js";
import { trackSchema, handleTrack } from "./tools/tracking.js";
import { getTerminalsSchema, handleGetTerminals } from "./tools/terminals.js";
import { createOrderSchema, handleCreateOrder } from "./tools/order.js";
import {
  getOrderHistorySchema,
  handleGetOrderHistory,
} from "./tools/order-history.js";

const VERSION = "1.1.1";
const logger = createLogger("delovye-linii-mcp");

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: "delovye-linii-mcp", version: VERSION });

  server.tool(
    "calculate",
    "Расчёт стоимости и сроков доставки Деловыми Линиями. ID городов берите из get_cities.",
    calculateSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCalculate(params) }],
    })),
  );

  server.tool(
    "get_cities",
    "Поиск городов в справочнике Деловых Линий. Возвращает cityID для calculate, get_terminals и create_order.",
    getCitiesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetCities(params) }],
    })),
  );

  server.tool(
    "track",
    "Отслеживание заказа Деловых Линий по номеру накладной: статус, маршрут, ключевые даты.",
    trackSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleTrack(params) }],
    })),
  );

  server.tool(
    "get_terminals",
    "Поиск терминалов Деловых Линий в указанном городе: адрес, часы работы, телефоны.",
    getTerminalsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetTerminals(params) }],
    })),
  );

  server.tool(
    "create_order",
    "Создание заказа на грузоперевозку в Деловых Линиях. Перед вызовом рассчитайте стоимость через calculate.",
    createOrderSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateOrder(params) }],
    })),
  );

  server.tool(
    "get_order_history",
    "История заказов Деловых Линий за период с постраничной выдачей.",
    getOrderHistorySchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetOrderHistory(params) }],
    })),
  );

  return server;
}

runServer(createMcpServer, {
  name: "delovye-linii-mcp",
  version: VERSION,
  toolCount: 6,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
