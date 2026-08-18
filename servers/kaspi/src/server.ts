/**
 * Kaspi.kz MCP server factory.
 *
 * 3 tools: get_orders, get_products, get_order.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
import { getOrdersSchema, handleGetOrders } from "./tools/orders.js";
import { getProductsSchema, handleGetProducts } from "./tools/products.js";
import { getOrderSchema, handleGetOrder } from "./tools/order.js";

export const logger = createLogger("kaspi-mcp");

export const TOOL_COUNT = 3;

const VERSION = "1.0.2";

export function createServer(): McpServer {
  const server = new McpServer({ name: "kaspi-mcp", version: VERSION });

  server.tool(
    "get_orders",
    "Получение списка заказов Kaspi с фильтрацией по статусу и дате.",
    getOrdersSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetOrders(params) }],
    })),
  );

  server.tool(
    "get_products",
    "Получение списка товаров продавца на Kaspi.",
    getProductsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetProducts(params) }],
    })),
  );

  server.tool(
    "get_order",
    "Получение детальной информации о заказе Kaspi по ID.",
    getOrderSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetOrder(params) }],
    })),
  );

  return server;
}
