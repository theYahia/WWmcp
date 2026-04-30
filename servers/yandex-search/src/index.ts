#!/usr/bin/env node

/**
 * @theyahia/yandex-search-mcp — MCP server for Yandex Cloud Search API
 *
 * Tools (3):
 *   wordstat_top_requests — топ связанных запросов для фразы (Wordstat topRequests)
 *   wordstat_regions      — распределение спроса по регионам РФ
 *   wordstat_dynamics     — месячный тренд объёма запросов
 *
 * Auth: YANDEX_SEARCH_API_KEY + YANDEX_FOLDER_ID (Yandex Cloud service account)
 * Endpoint: searchapi.api.cloud.yandex.net/v2/wordstat/*
 *
 * Transports:
 *   stdio (default) — Claude Desktop / Cursor / Claude Code
 *   Streamable HTTP — --http flag or HTTP_PORT env
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import http from "node:http";

import {
  wordstatTopRequestsSchema, handleWordstatTopRequests,
  wordstatRegionsSchema, handleWordstatRegions,
  wordstatDynamicsSchema, handleWordstatDynamics,
} from "./tools/wordstat.js";

const TOOL_COUNT = 3;

function createServer(): McpServer {
  const server = new McpServer({
    name: "yandex-search-mcp",
    version: "1.0.0",
  });

  server.tool(
    "wordstat_top_requests",
    "Получить топ связанных поисковых запросов для ключевой фразы через Yandex Wordstat. Возвращает фразы с месячным объёмом. Используйте для расширения семантического ядра и keyword research для российского рынка.",
    wordstatTopRequestsSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: await handleWordstatTopRequests(params) }],
    }),
  );

  server.tool(
    "wordstat_regions",
    "Анализ регионального распределения спроса по ключевой фразе. Показывает топ регионов РФ с объёмом запросов и affinity index (>100 = выше среднего по стране). Полезно для геотаргетинга и понимания региональных приоритетов.",
    wordstatRegionsSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: await handleWordstatRegions(params) }],
    }),
  );

  server.tool(
    "wordstat_dynamics",
    "Месячный тренд объёма поисковых запросов за несколько лет. Показывает сезонность и рост/падение интереса. Работает только для высокочастотных фраз (>10 000 запросов/мес). Для низкочастотников используйте wordstat_top_requests.",
    wordstatDynamicsSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: await handleWordstatDynamics(params) }],
    }),
  );

  return server;
}

// ── Server runner (stdio / HTTP) ──────────────────────────────────────────────

const useHttp = process.argv.includes("--http") || !!process.env.HTTP_PORT;

if (useHttp) {
  const port = Number(process.env.HTTP_PORT ?? 3000);
  const server = http.createServer(async (req, res) => {
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => transport.close());
    const mcpServer = createServer();
    await mcpServer.connect(transport);
    await transport.handleRequest(req, res, await new Promise<unknown>(r => {
      let body = "";
      req.on("data", c => (body += c));
      req.on("end", () => r(JSON.parse(body || "{}")));
    }));
  });
  server.listen(port, () =>
    console.error(`[yandex-search-mcp] HTTP on :${port} | ${TOOL_COUNT} tools`)
  );
} else {
  const transport = new StdioServerTransport();
  const mcpServer = createServer();
  await mcpServer.connect(transport);
  console.error(`[yandex-search-mcp] stdio | ${TOOL_COUNT} tools`);
}
