#!/usr/bin/env node

/**
 * @theyahia/bitrix24-mcp — MCP server for Bitrix24 CRM
 *
 * 4 tools: get_deals, create_deal, get_contacts, create_task.
 * Auth: webhook URL (no separate auth header needed).
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import { getDealsSchema, handleGetDeals, createDealSchema, handleCreateDeal } from "./tools/deals.js";
import { getContactsSchema, handleGetContacts } from "./tools/contacts.js";
import { createTaskSchema, handleCreateTask } from "./tools/tasks.js";

const logger = createLogger("bitrix24-mcp");

function createServer(): McpServer {
  const server = new McpServer({
    name: "bitrix24-mcp",
    version: "1.2.0",
  });

  server.tool(
    "get_deals",
    "List CRM deals from Bitrix24 with optional filters by stage and responsible user. Returns deal ID, title, stage, amount, currency, and dates. Supports pagination with offset parameter in multiples of 50.",
    getDealsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetDeals(params) }],
    })),
  );

  server.tool(
    "create_deal",
    "Create a new CRM deal in Bitrix24 with title, amount, stage, and linked contact or company. Returns the new deal ID on success. Supports all standard Bitrix24 deal fields including currency and comments.",
    createDealSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateDeal(params) }],
    })),
  );

  server.tool(
    "get_contacts",
    "List CRM contacts from Bitrix24 with optional filters by name, phone, or email. Returns contact details including phone numbers, emails, and linked company. Supports pagination with offset parameter.",
    getContactsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetContacts(params) }],
    })),
  );

  server.tool(
    "create_task",
    "Create a new task in Bitrix24 with title, description, responsible user, and deadline. Supports priority levels (low, normal, high) and project/group assignment. Returns the new task ID on success.",
    createTaskSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateTask(params) }],
    })),
  );

  return server;
}

runServer(createServer, {
  name: "bitrix24-mcp",
  version: "1.2.0",
  toolCount: 4,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
