#!/usr/bin/env node

/**
 * @theyahia/cbr-mcp — MCP server for Central Bank of Russia API
 *
 * 5 tools: get_daily_rates, get_currency_rate, get_key_rate,
 * get_precious_metals, convert_currency.
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
import { handleGetKeyRate } from "./tools/keyrate.js";

const logger = createLogger("cbr-mcp");

function createServer(): McpServer {
  const server = new McpServer({
    name: "cbr-mcp",
    version: "1.1.0",
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
    "get_key_rate",
    "Текущая ключевая ставка ЦБ РФ в процентах. Возвращает ставку и дату последнего изменения. Авторизация не требуется.",
    {},
    withErrorHandling(async () => ({
      content: [{ type: "text", text: await handleGetKeyRate() }],
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
  version: "1.1.0",
  toolCount: 5,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
