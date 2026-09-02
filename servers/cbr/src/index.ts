#!/usr/bin/env node

/**
 * @theyahia/cbr-mcp — MCP server for Central Bank of Russia API
 *
 * 7 tools: get_daily_rates, get_currency_rate, get_rate_dynamics, get_key_rate,
 * get_key_rate_history, get_precious_metals, convert_currency.
 * No auth required.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
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

const logger = createLogger("cbr-mcp");

function createServer(): McpServer {
  const server = new McpServer({
    name: "cbr-mcp",
    version: "1.2.0",
  });

  server.tool(
    "get_daily_rates",
    "Все курсы валют ЦБ РФ на указанную дату. Возвращает код, номинал, курс и изменение за день. Для конкретной валюты используйте get_currency_rate. Авторизация не требуется.",
    getDailyRatesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetDailyRates(params) }],
    })),
  );

  server.tool(
    "get_currency_rate",
    "Курс конкретной валюты к рублю с изменением за день. Для конвертации суммы используйте convert_currency. Код валюты: USD, EUR, CNY и др.",
    getCurrencyRateSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetCurrencyRate(params) }],
    })),
  );

  server.tool(
    "get_rate_dynamics",
    "Динамика курса валюты к рублю за период по данным ЦБ РФ: ряд значений плюс сводка (min/max/avg, изменение за период абсолютное и в процентах). Для курса на одну дату используйте get_currency_rate.",
    getRateDynamicsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetRateDynamics(params) }],
    })),
  );

  server.tool(
    "get_key_rate",
    "Текущая ключевая ставка ЦБ РФ в процентах и дата, с которой она действует. Для истории изменений используйте get_key_rate_history. Авторизация не требуется.",
    {},
    withErrorHandling(async () => ({
      content: [{ type: "text", text: await handleGetKeyRate() }],
    })),
  );

  server.tool(
    "get_key_rate_history",
    "История изменений ключевой ставки ЦБ РФ за период: даты вступления в силу и значения. По умолчанию — последний год. Для текущей ставки используйте get_key_rate.",
    getKeyRateHistorySchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetKeyRateHistory(params) }],
    })),
  );

  server.tool(
    "get_precious_metals",
    "Учётные цены ЦБ РФ на золото, серебро, платину и палладий в руб./грамм. Для исторических данных укажите дату.",
    getPreciousMetalsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetPreciousMetals(params) }],
    })),
  );

  server.tool(
    "convert_currency",
    "Конвертация суммы из одной валюты в другую через курс ЦБ РФ. Поддерживает все валюты ЦБ + RUB. Для просмотра доступных валют используйте get_daily_rates.",
    convertCurrencySchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleConvertCurrency(params) }],
    })),
  );

  return server;
}

runServer(createServer, {
  name: "cbr-mcp",
  version: "1.2.0",
  toolCount: 7,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
