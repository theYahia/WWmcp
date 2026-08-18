#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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

const allTools: ToolDef[] = [
  ...contactTools,
  ...salesInvoiceTools,
  ...purchaseBillTools,
  ...productTools,
  ...accountTools,
  ...eDocumentTools,
  ...salesOfferTools,
  ...referenceTools,
];

const server = new McpServer({ name: "parasut-mcp", version: VERSION });

const wrap =
  (handler: (params: any) => Promise<string>) =>
  async (params: any) => ({ content: [{ type: "text" as const, text: await handler(params) }] });

const seen = new Set<string>();
for (const t of allTools) {
  if (seen.has(t.name)) throw new Error(`Duplicate tool name: ${t.name}`);
  seen.add(t.name);
  server.tool(t.name, t.description, t.schema.shape, wrap(t.handler));
}

const TOOL_COUNT = allTools.length;

async function main() {
  const httpPort =
    process.env.HTTP_PORT ||
    (process.argv.includes("--http") ? process.argv[process.argv.indexOf("--http") + 1] : null);
  if (httpPort) {
    await startHttpTransport(parseInt(String(httpPort), 10) || 3000);
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`[parasut-mcp] Server started (stdio). ${TOOL_COUNT} tools available.`);
  }
}

async function startHttpTransport(port: number) {
  const { createServer } = await import("node:http");
  const { StreamableHTTPServerTransport } = await import("@modelcontextprotocol/sdk/server/streamableHttp.js");
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined as unknown as () => string,
  });
  // CORS is opt-in: only emit Access-Control-Allow-Origin when explicitly
  // configured. The HTTP transport drives tools that act on the configured
  // Parasut credentials, so a wildcard default would let any web page use them.
  const corsOrigin = process.env.PARASUT_HTTP_CORS_ORIGIN;
  const httpServer = createServer(async (req, res) => {
    if (corsOrigin) {
      res.setHeader("Access-Control-Allow-Origin", corsOrigin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PATCH, DELETE");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization");
    }
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", tools: TOOL_COUNT, transport: "streamable-http", version: VERSION }));
      return;
    }
    if (req.url === "/mcp") {
      await transport.handleRequest(req, res);
      return;
    }
    res.writeHead(404);
    res.end("Not found. Use /mcp or /health.");
  });
  await server.connect(transport);
  httpServer.listen(port, () => {
    console.error(`[parasut-mcp] HTTP server on port ${port}. ${TOOL_COUNT} tools available.`);
  });
}

const isDirectRun = process.argv[1]?.endsWith("index.js") || process.argv[1]?.endsWith("index.ts");
if (isDirectRun) {
  main().catch((error) => {
    console.error("[parasut-mcp] Error:", error);
    process.exit(1);
  });
}

export { server, allTools, TOOL_COUNT };
