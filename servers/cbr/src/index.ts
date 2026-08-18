#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  getDailyRatesSchema,
  handleGetDailyRates,
  getCurrencyRateSchema,
  handleGetCurrencyRate,
} from "./tools/rates.js";
import { getPreciousMetalsSchema, handleGetPreciousMetals } from "./tools/metals.js";
import { convertCurrencySchema, handleConvertCurrency } from "./tools/convert.js";
import {
  handleGetKeyRate,
  getKeyRateHistorySchema,
  handleGetKeyRateHistory,
} from "./tools/keyrate.js";
import { getRateDynamicsSchema, handleGetRateDynamics } from "./tools/dynamics.js";

function readVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf-8")) as {
      version?: string;
    };
    return typeof pkg.version === "string" ? pkg.version : "0.0.0";
  } catch {
    return "0.0.0";
  }
}

/** Оборачивает хендлер: ловит ошибки и отдаёт их MCP-клиенту как isError, а не падает. */
function wrapTool<P>(handler: (params: P) => Promise<string>) {
  return async (params: P) => {
    try {
      return { content: [{ type: "text" as const, text: await handler(params) }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text" as const, text: `Ошибка: ${message}` }],
        isError: true,
      };
    }
  };
}

const server = new McpServer({
  name: "cbr-mcp",
  version: readVersion(),
});

server.tool(
  "get_daily_rates",
  "Все курсы валют ЦБ РФ на указанную дату (по умолчанию сегодня). Без авторизации.",
  getDailyRatesSchema.shape,
  wrapTool(handleGetDailyRates),
);

server.tool(
  "get_currency_rate",
  "Курс конкретной валюты к рублю с изменением за день.",
  getCurrencyRateSchema.shape,
  wrapTool(handleGetCurrencyRate),
);

server.tool(
  "get_rate_dynamics",
  "Динамика курса валюты к рублю за период (ряд значений + сводка: min/max/avg, изменение).",
  getRateDynamicsSchema.shape,
  wrapTool(handleGetRateDynamics),
);

server.tool(
  "get_key_rate",
  "Текущая ключевая ставка ЦБ РФ и дата вступления в силу.",
  {},
  wrapTool(handleGetKeyRate),
);

server.tool(
  "get_key_rate_history",
  "История изменений ключевой ставки ЦБ РФ за период.",
  getKeyRateHistorySchema.shape,
  wrapTool(handleGetKeyRateHistory),
);

server.tool(
  "get_precious_metals",
  "Учётные цены ЦБ РФ на золото, серебро, платину, палладий (руб./грамм).",
  getPreciousMetalsSchema.shape,
  wrapTool(handleGetPreciousMetals),
);

server.tool(
  "convert_currency",
  "Конвертация суммы из одной валюты в другую через курс ЦБ РФ.",
  convertCurrencySchema.shape,
  wrapTool(handleConvertCurrency),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[cbr-mcp] Сервер запущен. 7 инструментов. Авторизация не требуется.");
}

main().catch((error) => {
  console.error("[cbr-mcp] Ошибка запуска:", error);
  process.exit(1);
});
