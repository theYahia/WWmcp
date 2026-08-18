#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "node:http";
import { getCallsSchema, handleGetCalls } from "./tools/calls.js";
import { getStatisticsSchema, handleGetStatistics } from "./tools/statistics.js";
import { getLeadsSchema, handleGetLeads } from "./tools/leads.js";
import { getSourcesSchema, handleGetSources } from "./tools/sources.js";
import { getTagsSchema, handleGetTags } from "./tools/tags.js";

const VERSION = "1.2.0";

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "calltouch-mcp",
    version: VERSION,
  });

  // --- Tools (5) ---

  server.tool(
    "get_calls",
    "Список звонков Calltouch: номер, источник, длительность, статус, UTM-метки.",
    getCallsSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: await handleGetCalls(params) }],
    }),
  );

  server.tool(
    "get_statistics",
    "Статистика звонков по дням: всего, уникальных, целевых, пропущенных.",
    getStatisticsSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: await handleGetStatistics(params) }],
    }),
  );

  server.tool(
    "get_leads",
    "Список лидов Calltouch: заявки с сайта, формы обратной связи.",
    getLeadsSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: await handleGetLeads(params) }],
    }),
  );

  server.tool(
    "get_sources",
    "Источники трафика: каналы, кампании, эффективность по звонкам.",
    getSourcesSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: await handleGetSources(params) }],
    }),
  );

  server.tool(
    "get_tags",
    "Теги звонков: категории, метки, присвоенные менеджерами.",
    getTagsSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: await handleGetTags(params) }],
    }),
  );

  // --- Skills (2) ---

  server.tool(
    "skill_calls_today",
    "Звонки за сегодня — быстрый отчёт: всего, целевых, пропущенных, средняя длительность.",
    {},
    async () => {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      const dateStr = `${dd}/${mm}/${yyyy}`;

      const callsText = await handleGetCalls({ date_from: dateStr, date_to: dateStr });
      const statsText = await handleGetStatistics({ date_from: dateStr, date_to: dateStr });

      let calls: { records?: any[] } = {};
      let stats: { total?: Record<string, number> } = {};
      try { calls = JSON.parse(callsText); } catch { /* empty */ }
      try { stats = JSON.parse(statsText); } catch { /* empty */ }

      const total = stats.total?.calls_count ?? (calls.records?.length ?? 0);
      const target = stats.total?.target_calls ?? "н/д";
      const missed = stats.total?.missed_calls ?? "н/д";

      let avgDuration = "н/д";
      if (Array.isArray(calls.records) && calls.records.length > 0) {
        const sum = calls.records.reduce(
          (acc: number, c: any) => acc + (c.duration ?? 0),
          0,
        );
        avgDuration = `${Math.round(sum / calls.records.length)} сек`;
      }

      const report = [
        `Звонки за ${dateStr}`,
        `Всего: ${total}`,
        `Целевых: ${target}`,
        `Пропущенных: ${missed}`,
        `Средняя длительность: ${avgDuration}`,
      ].join("\n");

      return { content: [{ type: "text" as const, text: report }] };
    },
  );

  server.tool(
    "skill_sources",
    "Эффективность источников — топ источников по количеству звонков за период.",
    {
      date_from: getSourcesSchema.shape.date_from,
      date_to: getSourcesSchema.shape.date_to,
    },
    async (params) => {
      const sourcesText = await handleGetSources(params);

      let sources: unknown[] = [];
      try {
        const parsed = JSON.parse(sourcesText);
        sources = Array.isArray(parsed) ? parsed : (parsed.data ?? parsed.records ?? []);
      } catch { /* empty */ }

      if (!Array.isArray(sources) || sources.length === 0) {
        return { content: [{ type: "text" as const, text: "Нет данных по источникам за указанный период." }] };
      }

      const sorted = [...sources]
        .sort((a: any, b: any) => (b.calls_count ?? b.count ?? 0) - (a.calls_count ?? a.count ?? 0))
        .slice(0, 10);

      const lines = sorted.map(
        (s: any, i: number) =>
          `${i + 1}. ${s.source ?? s.name ?? "Неизвестно"} — ${s.calls_count ?? s.count ?? 0} звонков`,
      );

      const report = [
        `Топ источников (${params.date_from} — ${params.date_to}):`,
        ...lines,
      ].join("\n");

      return { content: [{ type: "text" as const, text: report }] };
    },
  );

  return server;
}

async function main() {
  const useHttp = process.argv.includes("--http");

  if (useHttp) {
    const port = parseInt(process.env.PORT ?? "3000", 10);
    const server = createMcpServer();

    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    await server.connect(transport);

    const httpServer = createServer(async (req, res) => {
      const url = new URL(req.url ?? "/", `http://localhost:${port}`);

      if (url.pathname === "/mcp" && req.method === "POST") {
        await transport.handleRequest(req, res);
      } else if (url.pathname === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", version: VERSION, tools: 7 }));
      } else {
        res.writeHead(404);
        res.end("Not Found");
      }
    });

    httpServer.listen(port, () => {
      console.error(`[calltouch-mcp] HTTP на порту ${port}. POST /mcp для MCP. GET /health для проверки.`);
    });
  } else {
    const server = createMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`[calltouch-mcp] Сервер запущен (stdio). ${VERSION}. 7 инструментов.`);
  }
}

main().catch((error) => {
  console.error("[calltouch-mcp] Ошибка запуска:", error);
  process.exit(1);
});
