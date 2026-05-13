#!/usr/bin/env node

/**
 * @theyahia/vacancy-mcp — MCP server для поиска вакансий.
 *
 * Источники данных: night-loop vacancies-scan output (Habr Career, TG digest,
 * career pages SPA). Импорт через scripts/import_from_night_loop.ts.
 *
 * 5 tools:
 *   - search_vacancies  — full-text search (FTS5) с фильтрами
 *   - get_vacancy       — детали по ID
 *   - list_companies    — компании в базе с counts
 *   - today_digest      — что нового за N часов
 *   - market_pulse      — aggregate stats по роли (median зарплаты, top hiring)
 *
 * Транспорт: stdio. Запуск: `node dist/index.js` или `npm run dev`.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";

import { getDb, closeDb } from "./db.js";
import {
  searchVacanciesSchema,
  handleSearchVacancies,
  getVacancySchema,
  handleGetVacancy,
  listCompaniesSchema,
  handleListCompanies,
} from "./tools/search.js";
import { todayDigestSchema, handleTodayDigest } from "./tools/digest.js";
import { marketPulseSchema, handleMarketPulse } from "./tools/market_pulse.js";

// Используем нативный MCP SDK напрямую (не через @theyahia/mcp-core), потому что
// vacancy-mcp — это локальный source-of-truth сервер, а не HTTP-обёртка над API.
// Это согласуется с pure-stdlib pattern (claude-webcache).

interface ToolDef<T extends z.ZodObject<z.ZodRawShape>> {
  name: string;
  description: string;
  schema: T;
  handler: (params: z.infer<T>) => Promise<string>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TOOLS: ToolDef<any>[] = [
  {
    name: "search_vacancies",
    description:
      "Full-text поиск по title/company/raw. Фильтры: source, location, salary_min. По умолчанию 20 результатов.",
    schema: searchVacanciesSchema,
    handler: handleSearchVacancies,
  },
  {
    name: "get_vacancy",
    description:
      "Получить полную карточку вакансии по ID (включая raw payload из источника).",
    schema: getVacancySchema,
    handler: handleGetVacancy,
  },
  {
    name: "list_companies",
    description:
      "Список компаний с counts по вакансиям. Полезно для market mapping.",
    schema: listCompaniesSchema,
    handler: handleListCompanies,
  },
  {
    name: "today_digest",
    description:
      "Что нового за последние N часов (default 24h). Группировка по source.",
    schema: todayDigestSchema,
    handler: handleTodayDigest,
  },
  {
    name: "market_pulse",
    description:
      "Агрегатная статистика: total positions, median salary (рубли), top hiring companies. Фильтр по роли (substring).",
    schema: marketPulseSchema,
    handler: handleMarketPulse,
  },
];

async function main(): Promise<void> {
  // Прогреваем БД (создаст schema если файл новый).
  getDb();

  const server = new Server(
    { name: "vacancy-mcp", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: zodToJsonSchema(t.schema, { target: "openApi3" }) as Record<string, unknown>,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const tool = TOOLS.find((t) => t.name === req.params.name);
    if (!tool) {
      throw new Error(`Unknown tool: ${req.params.name}`);
    }
    try {
      const parsed = tool.schema.parse(req.params.arguments ?? {});
      const text = await tool.handler(parsed);
      return { content: [{ type: "text", text }] };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        isError: true,
        content: [{ type: "text", text: `Error in ${tool.name}: ${msg}` }],
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.on("SIGINT", () => {
    closeDb();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    closeDb();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("[vacancy-mcp] fatal:", err);
  closeDb();
  process.exit(1);
});
