/**
 * Фабрика MCP-сервера CHANGEME.
 *
 * Отделена от `index.ts` намеренно: HTTP-транспорт создаёт по серверу на сессию
 * (`runServer` зовёт фабрику повторно), а тесты поднимают сервер без запуска
 * транспорта. Точка входа остаётся тонкой и не содержит логики.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
import { listItemsSchema, handleListItems } from "./tools/example.js";

export const logger = createLogger("CHANGEME-mcp");

/**
 * Число инструментов. Держится рядом с регистрацией и импортируется тестами и
 * точкой входа — так `/health`, e2e-смоук и README не расходятся с кодом.
 * Обновляй вместе с каждым добавленным `server.tool(...)`.
 */
export const TOOL_COUNT = 1;

export function createServer(): McpServer {
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
