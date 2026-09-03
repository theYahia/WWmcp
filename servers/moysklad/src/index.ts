#!/usr/bin/env node

/**
 * @theyahia/moysklad-mcp — MCP server for MoySklad ERP/inventory API
 *
 * 60 tools across 16 modules: catalog, stock, counterparties, orders,
 * shipments, warehouse documents (move/enter/loss/inventory/returns),
 * finance (payments, cash, invoices), reports, reference lists and audit log.
 *
 * Auth: Bearer token (MOYSKLAD_TOKEN) or Basic (MOYSKLAD_LOGIN + MOYSKLAD_PASSWORD).
 * Rate limit: token bucket 45 req / 3s (stock reports charged 5 units each).
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import type { ToolDef } from "./types.js";

import { tools as productTools } from "./tools/products.js";
import { tools as stockTools } from "./tools/stock.js";
import { tools as counterpartyTools } from "./tools/counterparties.js";
import { tools as orderTools } from "./tools/orders.js";
import { tools as reportTools } from "./tools/reports.js";
import { tools as supplyTools } from "./tools/supply.js";
import { tools as shipmentTools } from "./tools/shipments.js";
import { tools as storeTools } from "./tools/stores.js";
import { tools as organizationTools } from "./tools/organizations.js";
import { tools as webhookTools } from "./tools/webhooks.js";
import { tools as documentTools } from "./tools/documents.js";
import { tools as financeTools } from "./tools/finance.js";
import { tools as catalogTools } from "./tools/catalog.js";
import { tools as reportsExtraTools } from "./tools/reports_extra.js";
import { tools as referenceTools } from "./tools/reference.js";
import { tools as auditTools } from "./tools/audit.js";

const logger = createLogger("moysklad-mcp");

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { version: string };
const VERSION: string = pkg.version;

const ALL_TOOLS: ToolDef[] = [
  ...productTools,
  ...catalogTools,
  ...stockTools,
  ...counterpartyTools,
  ...orderTools,
  ...shipmentTools,
  ...supplyTools,
  ...documentTools,
  ...financeTools,
  ...reportTools,
  ...reportsExtraTools,
  ...storeTools,
  ...organizationTools,
  ...referenceTools,
  ...webhookTools,
  ...auditTools,
];

/**
 * Numeric literal so `scripts/catalog.mjs` can read the declared count without
 * running the server; the check below fails the process if it ever drifts from
 * what is actually registered.
 */
export const TOOL_COUNT = 60;

if (ALL_TOOLS.length !== TOOL_COUNT) {
  throw new Error(`TOOL_COUNT is ${TOOL_COUNT} but ${ALL_TOOLS.length} tools are registered.`);
}

function createServer(): McpServer {
  const server = new McpServer({ name: "moysklad-mcp", version: VERSION });

  const seen = new Set<string>();
  for (const tool of ALL_TOOLS) {
    if (seen.has(tool.name)) throw new Error(`Duplicate tool name: ${tool.name}`);
    seen.add(tool.name);
    server.tool(
      tool.name,
      tool.description,
      tool.schema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await tool.handler(params) }],
      })),
    );
  }

  return server;
}

runServer(createServer, {
  name: "moysklad-mcp",
  version: VERSION,
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
