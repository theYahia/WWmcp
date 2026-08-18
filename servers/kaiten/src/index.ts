#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { VERSION } from "./version.js";
import type { ToolDef } from "./types.js";

import { tools as spaceTools } from "./tools/spaces.js";
import { tools as boardTools } from "./tools/boards.js";
import { tools as columnTools } from "./tools/columns.js";
import { tools as laneTools } from "./tools/lanes.js";
import { tools as cardTools } from "./tools/cards.js";
import { tools as commentTools } from "./tools/card_comments.js";
import { tools as memberTools } from "./tools/card_members.js";
import { tools as cardTagTools } from "./tools/card_tags.js";
import { tools as childTools } from "./tools/card_children.js";
import { tools as externalLinkTools } from "./tools/card_external_links.js";
import { tools as blockerTools } from "./tools/card_blockers.js";
import { tools as checklistTools } from "./tools/card_checklists.js";
import { tools as tagTools } from "./tools/tags.js";
import { tools as userTools } from "./tools/users.js";
import { tools as cardTypeTools } from "./tools/card_types.js";
import { tools as sprintTools } from "./tools/sprints.js";
import { tools as customPropertyTools } from "./tools/custom_properties.js";

const allTools: ToolDef[] = [
  ...spaceTools,
  ...boardTools,
  ...columnTools,
  ...laneTools,
  ...cardTools,
  ...commentTools,
  ...memberTools,
  ...cardTagTools,
  ...childTools,
  ...externalLinkTools,
  ...blockerTools,
  ...checklistTools,
  ...tagTools,
  ...userTools,
  ...cardTypeTools,
  ...sprintTools,
  ...customPropertyTools,
];

const server = new McpServer({ name: "kaiten-mcp", version: VERSION });

const wrap = (handler: (params: any) => Promise<string>) => async (params: any) => ({
  content: [{ type: "text" as const, text: await handler(params) }],
});

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
    const port = parseInt(String(httpPort), 10) || 3000;
    await startHttpTransport(port);
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`[kaiten-mcp] Server started (stdio). ${TOOL_COUNT} tools available.`);
  }
}

async function startHttpTransport(port: number) {
  const { createServer } = await import("node:http");
  const { StreamableHTTPServerTransport } = await import("@modelcontextprotocol/sdk/server/streamableHttp.js");
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined as unknown as () => string });
  // CORS is opt-in: only emit Access-Control-Allow-Origin when explicitly
  // configured. The HTTP transport acts on the configured Kaiten token, so a
  // wildcard default would let any web page drive it.
  const corsOrigin = process.env.KAITEN_HTTP_CORS_ORIGIN;
  const httpServer = createServer(async (req, res) => {
    if (corsOrigin) {
      res.setHeader("Access-Control-Allow-Origin", corsOrigin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
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
    console.error(`[kaiten-mcp] HTTP server on port ${port}. ${TOOL_COUNT} tools available.`);
  });
}

const isDirectRun = process.argv[1]?.endsWith("index.js") || process.argv[1]?.endsWith("index.ts");
if (isDirectRun) {
  main().catch((error) => {
    console.error("[kaiten-mcp] Error:", error);
    process.exit(1);
  });
}

export { server, allTools };
