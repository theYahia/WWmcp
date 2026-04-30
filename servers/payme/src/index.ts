#!/usr/bin/env node

/**
 * @theyahia/payme-mcp — MCP server for Payme Subscribe API (Uzbekistan)
 *
 * 10 tools: cards_create, cards_verify, cards_check, cards_remove,
 * receipts_create, receipts_pay, receipts_send, receipts_cancel,
 * receipts_check, receipts_get_all.
 * Auth: X-Auth header with cashboxId:key.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import { JsonRpcClient } from "./client.js";
import { cardTools, handleCardTool } from "./tools/cards.js";
import { receiptTools, handleReceiptTool } from "./tools/receipts.js";

const logger = createLogger("payme-mcp");

function createServer(): McpServer {
  const cashboxId = process.env.PAYME_CASHBOX_ID;
  const key = process.env.PAYME_KEY;

  if (!cashboxId || !key) {
    throw new Error("PAYME_CASHBOX_ID and PAYME_KEY environment variables are required.");
  }

  const sandbox = process.env.PAYME_SANDBOX !== "false";
  const client = new JsonRpcClient(cashboxId, key, sandbox);

  const server = new McpServer({
    name: "payme-mcp",
    version: "1.1.0",
  });

  // Register card tools
  for (const tool of cardTools) {
    server.tool(
      tool.name,
      tool.description,
      tool.inputSchema,
      withErrorHandling(async (args: Record<string, unknown>) => {
        const result = await handleCardTool(tool.name, args, client);
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      }),
    );
  }

  // Register receipt tools
  for (const tool of receiptTools) {
    server.tool(
      tool.name,
      tool.description,
      tool.inputSchema,
      withErrorHandling(async (args: Record<string, unknown>) => {
        const result = await handleReceiptTool(tool.name, args, client);
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      }),
    );
  }

  return server;
}

runServer(createServer, {
  name: "payme-mcp",
  version: "1.1.0",
  toolCount: 10,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
