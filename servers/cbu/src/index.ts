#!/usr/bin/env node

/**
 * @theyahia/cbu-mcp — MCP server for Central Bank of Uzbekistan API
 *
 * 5 tools: get_all_rates, get_currency_rate, get_historical_rates,
 * convert_currency, get_rate_dynamics.
 * No auth required.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import {
  getAllRatesSchema, handleGetAllRates,
  getCurrencyRateSchema, handleGetCurrencyRate,
  getHistoricalRatesSchema, handleGetHistoricalRates,
} from "./tools/rates.js";
import {
  convertCurrencySchema, handleConvertCurrency,
  getRateDynamicsSchema, handleGetRateDynamics,
} from "./tools/convert.js";

const logger = createLogger("cbu-mcp");

function createServer(): McpServer {
  const server = new McpServer({
    name: "cbu-mcp",
    version: "1.1.0",
  });

  server.tool(
    "get_all_rates",
    "Get all current exchange rates from the Central Bank of Uzbekistan, approximately 30 currencies. Returns currency code, name, rate per nominal in UZS, and daily change. No authentication required.",
    getAllRatesSchema.shape,
    withErrorHandling(async () => ({
      content: [{ type: "text", text: await handleGetAllRates() }],
    })),
  );

  server.tool(
    "get_currency_rate",
    "Get the exchange rate for a specific currency from the Central Bank of Uzbekistan. Supports USD, EUR, RUB, GBP, and more. Optionally specify a date for historical rates.",
    getCurrencyRateSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetCurrencyRate(params) }],
    })),
  );

  server.tool(
    "get_historical_rates",
    "Get all exchange rates from the Central Bank of Uzbekistan for a specific historical date. Returns the same format as get_all_rates but for the requested date. Date must be in YYYY-MM-DD format.",
    getHistoricalRatesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetHistoricalRates(params) }],
    })),
  );

  server.tool(
    "convert_currency",
    "Convert between currencies using Central Bank of Uzbekistan rates. Defaults to converting to UZS. Supports cross-currency conversion via UZS as an intermediary. Optionally specify a date for historical rates.",
    convertCurrencySchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleConvertCurrency(params) }],
    })),
  );

  server.tool(
    "get_rate_dynamics",
    "Get the current rate and daily change direction for a currency from the Central Bank of Uzbekistan. Returns rate value, nominal, daily difference, and direction (up/down/unchanged).",
    getRateDynamicsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetRateDynamics(params) }],
    })),
  );

  return server;
}

runServer(createServer, {
  name: "cbu-mcp",
  version: "1.1.0",
  toolCount: 5,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
