#!/usr/bin/env node

/**
 * @theyahia/CHANGEME-mcp — MCP server for CHANGEME API
 *
 * Tools: list_items, get_item
 * Auth: API Key (Bearer)
 *
 * Transports:
 *   - stdio (default) — for Claude Desktop / Cursor / Windsurf
 *   - Streamable HTTP — --http flag or HTTP_PORT env
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import { listItemsSchema, handleListItems } from "./tools/example.js";

const logger = createLogger("CHANGEME-mcp");

function createServer(): McpServer {
  const server = new McpServer({
    name: "CHANGEME-mcp",
    version: "1.0.0",
  });

  server.tool(
    "list_items",
    "Получить список элементов. Возвращает ID, название и статус. Для деталей используйте get_item. Максимум 100 результатов.",
    listItemsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListItems(params) }],
    })),
  );

  return server;
}

runServer(createServer, {
  name: "CHANGEME-mcp",
  version: "1.0.0",
  toolCount: 1,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
