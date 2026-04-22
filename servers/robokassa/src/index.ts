#!/usr/bin/env node

/**
 * @theyahia/robokassa-mcp — MCP server for Robokassa payment API
 *
 * 2 tools: create_invoice, check_invoice.
 * Auth: MD5 signature (custom, not abstracted).
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import {
  createInvoiceSchema, handleCreateInvoice,
  checkInvoiceSchema, handleCheckInvoice,
} from "./tools/invoices.js";

const logger = createLogger("robokassa-mcp");

function createServer(): McpServer {
  const server = new McpServer({
    name: "robokassa-mcp",
    version: "1.2.0",
  });

  server.tool(
    "create_invoice",
    "Create a Robokassa payment invoice and get a payment URL with MD5 signature. Supports 54-FZ fiscal receipt items for tax compliance. Returns the payment link, invoice ID, and amount.",
    createInvoiceSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateInvoice(params) }],
    })),
  );

  server.tool(
    "check_invoice",
    "Check the status of a Robokassa invoice by invoice number using the OpStateExt XML interface. Returns state code, result code, payment method, and client details. Signature is generated with Password2.",
    checkInvoiceSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCheckInvoice(params) }],
    })),
  );

  return server;
}

runServer(createServer, {
  name: "robokassa-mcp",
  version: "1.2.0",
  toolCount: 2,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
