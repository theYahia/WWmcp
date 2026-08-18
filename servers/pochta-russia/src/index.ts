#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { VERSION } from "./version.js";
import { trackSchema, handleTrack } from "./tools/tracking.js";
import { calculateSchema, handleCalculate } from "./tools/calculate.js";
import { getOfficesSchema, handleGetOffices } from "./tools/offices.js";
import { zipLookupSchema, handleZipLookup } from "./tools/zip_lookup.js";
import { deliveryTimeSchema, handleDeliveryTime } from "./tools/delivery_time.js";
import { normalizeAddressSchema, handleNormalizeAddress } from "./tools/normalize_address.js";

interface ToolDef {
  name: string;
  description: string;
  schema: z.ZodObject<z.ZodRawShape>;
  handler: (params: never) => Promise<string>;
}

const TOOLS: ToolDef[] = [
  {
    name: "track",
    description: "Отслеживание почтового отправления Почты России по трек-номеру.",
    schema: trackSchema,
    handler: handleTrack as (params: never) => Promise<string>,
  },
  {
    name: "calculate",
    description: "Расчёт стоимости и сроков доставки Почтой России.",
    schema: calculateSchema,
    handler: handleCalculate as (params: never) => Promise<string>,
  },
  {
    name: "get_offices",
    description: "Поиск почтовых отделений по индексу или населённому пункту.",
    schema: getOfficesSchema,
    handler: handleGetOffices as (params: never) => Promise<string>,
  },
  {
    name: "zip_lookup",
    description: "Информация по почтовому индексу: регион, город, график работы.",
    schema: zipLookupSchema,
    handler: handleZipLookup as (params: never) => Promise<string>,
  },
  {
    name: "delivery_time",
    description: "Расчёт сроков доставки между двумя индексами.",
    schema: deliveryTimeSchema,
    handler: handleDeliveryTime as (params: never) => Promise<string>,
  },
  {
    name: "normalize_address",
    description: "Нормализация адреса через API Почты России.",
    schema: normalizeAddressSchema,
    handler: handleNormalizeAddress as (params: never) => Promise<string>,
  },
];

export const TOOL_COUNT = TOOLS.length;

function createServer(): McpServer {
  const server = new McpServer({ name: "pochta-russia-mcp", version: VERSION });

  const seen = new Set<string>();
  for (const tool of TOOLS) {
    if (seen.has(tool.name)) throw new Error(`Duplicate tool name: ${tool.name}`);
    seen.add(tool.name);
    server.tool(tool.name, tool.description, tool.schema.shape, async (params) => ({
      content: [{ type: "text", text: await tool.handler(params as never) }],
    }));
  }

  return server;
}

export { createServer };

async function main() {
  const args = process.argv.slice(2);
  const httpMode = args.includes("--http");
  const portArg = args.find((a) => a.startsWith("--port="));
  const port = portArg ? parseInt(portArg.split("=")[1], 10) : 3000;

  const server = createServer();

  if (httpMode) {
    const { StreamableHTTPServerTransport } = await import(
      "@modelcontextprotocol/sdk/server/streamableHttp.js"
    );
    const http = await import("node:http");

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
    });
    await server.connect(transport);

    const httpServer = http.createServer(async (req, res) => {
      const url = new URL(req.url ?? "/", `http://localhost:${port}`);
      if (url.pathname === "/mcp") {
        await transport.handleRequest(req, res);
      } else if (url.pathname === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", version: VERSION, tools: TOOL_COUNT }));
      } else {
        res.writeHead(404);
        res.end("Not found");
      }
    });

    httpServer.listen(port, () => {
      console.error(`[pochta-russia-mcp] HTTP-сервер на порту ${port}. ${TOOL_COUNT} инструментов.`);
      console.error(`[pochta-russia-mcp] MCP endpoint: http://localhost:${port}/mcp`);
    });
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(
      `[pochta-russia-mcp] Сервер запущен (stdio). ${TOOL_COUNT} инструментов. v${VERSION}`,
    );
  }
}

main().catch((error) => {
  console.error("[pochta-russia-mcp] Ошибка:", error);
  process.exit(1);
});
