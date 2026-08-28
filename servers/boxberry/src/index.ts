#!/usr/bin/env node

/**
 * @theyahia/boxberry-mcp — MCP server for the Boxberry delivery API.
 *
 * 6 tools: list_cities, list_points, calc_delivery, track, zip_check,
 * list_services. Requires BOXBERRY_API_TOKEN.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import { listCitiesSchema, handleListCities } from "./tools/cities.js";
import { listPointsSchema, handleListPoints } from "./tools/points.js";
import { calcDeliverySchema, handleCalcDelivery } from "./tools/calculate.js";
import { trackSchema, handleTrack } from "./tools/tracking.js";
import { zipCodesSchema, handleZipCodes } from "./tools/zip-codes.js";
import { listServicesSchema, handleListServices } from "./tools/services.js";

const logger = createLogger("boxberry-mcp");

function createServer(): McpServer {
  const server = new McpServer({ name: "boxberry-mcp", version: "1.1.1" });

  server.tool(
    "list_cities",
    "Список городов Boxberry с возможностью поиска по названию.",
    listCitiesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListCities(params) }],
    })),
  );

  server.tool(
    "list_points",
    "Список пунктов выдачи Boxberry в указанном городе.",
    listPointsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListPoints(params) }],
    })),
  );

  server.tool(
    "calc_delivery",
    "Расчёт стоимости и сроков доставки Boxberry.",
    calcDeliverySchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCalcDelivery(params) }],
    })),
  );

  server.tool(
    "track",
    "Отслеживание отправления Boxberry по трек-номеру.",
    trackSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleTrack(params) }],
    })),
  );

  server.tool(
    "zip_check",
    "Проверка почтового индекса на доступность доставки Boxberry.",
    zipCodesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleZipCodes(params) }],
    })),
  );

  server.tool(
    "list_services",
    "Список оказанных услуг по отправлению Boxberry.",
    listServicesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListServices(params) }],
    })),
  );

  return server;
}

runServer(createServer, {
  name: "boxberry-mcp",
  version: "1.1.1",
  toolCount: 6,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
