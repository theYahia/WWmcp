/**
 * Paraşüt MCP server factory: the tool registry + `createServer()`.
 *
 * Kept apart from `index.ts` so tests (and the HTTP transport, which builds a
 * server per session) can import it without starting a transport.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { VERSION } from "./version.js";
import type { ToolDef } from "./types.js";

import { tools as contactTools } from "./tools/contacts.js";
import { tools as salesInvoiceTools } from "./tools/sales_invoices.js";
import { tools as purchaseBillTools } from "./tools/purchase_bills.js";
import { tools as productTools } from "./tools/products.js";
import { tools as accountTools } from "./tools/accounts.js";
import { tools as eDocumentTools } from "./tools/e_documents.js";
import { tools as salesOfferTools } from "./tools/sales_offers.js";
import { tools as referenceTools } from "./tools/reference.js";

export { logger } from "./client.js";
export { VERSION };

export const allTools: ToolDef[] = [
  ...contactTools,
  ...salesInvoiceTools,
  ...purchaseBillTools,
  ...productTools,
  ...accountTools,
  ...eDocumentTools,
  ...salesOfferTools,
  ...referenceTools,
];

const seen = new Set<string>();
for (const t of allTools) {
  if (seen.has(t.name)) throw new Error(`Duplicate tool name: ${t.name}`);
  seen.add(t.name);
}

export const TOOL_COUNT = allTools.length;

export function createServer(): McpServer {
  const server = new McpServer({ name: "parasut-mcp", version: VERSION });
  for (const t of allTools) {
    server.tool(
      t.name,
      t.description,
      t.schema.shape,
      withErrorHandling(async (params: any) => ({
        content: [{ type: "text" as const, text: await t.handler(params) }],
      })),
    );
  }
  return server;
}
