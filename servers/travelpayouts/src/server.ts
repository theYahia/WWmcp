/**
 * Server factory — tool registration for @theyahia/travelpayouts-mcp.
 * Kept out of index.ts so tests can build the server without booting a transport.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
import {
  searchFlightsPricesSchema, handleSearchFlightsPrices,
  getCheapestMonthSchema, handleGetCheapestMonth,
  getCalendarPricesSchema, handleGetCalendarPrices,
  getPopularDirectionsSchema, handleGetPopularDirections,
  getAirlineDirectionsSchema, handleGetAirlineDirections,
  getSpecialOffersSchema, handleGetSpecialOffers,
  getDirectRoutesSchema, handleGetDirectRoutes,
  getNearestPricesSchema, handleGetNearestPrices,
} from "./tools/flights.js";
import {
  searchHotelsSchema, handleSearchHotels,
  getHotelPricesSchema, handleGetHotelPrices,
} from "./tools/hotels.js";
import {
  lookupAirportsSchema, handleLookupAirports,
  lookupAirlinesSchema, handleLookupAirlines,
  lookupCitiesSchema, handleLookupCities,
} from "./tools/lookup.js";

export const logger = createLogger("travelpayouts-mcp");

export function createServer(): McpServer {
  const server = new McpServer({
    name: "travelpayouts-mcp",
    version: "2.1.0",
  });

  server.tool(
    "search_flights_prices",
    "Поиск дешёвых авиабилетов между двумя городами. IATA-коды городов (MOW, LED, IST). Поддерживает фильтрацию по дате и валюте. Возвращает цены, авиакомпании и детали рейсов.",
    searchFlightsPricesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSearchFlightsPrices(params) }],
    })),
  );

  server.tool(
    "get_cheapest_month",
    "Самые дешёвые авиабилеты на указанный месяц между двумя городами. Удобно для планирования — показывает минимальные цены за весь месяц.",
    getCheapestMonthSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetCheapestMonth(params) }],
    })),
  );

  server.tool(
    "get_calendar_prices",
    "Календарь цен на авиабилеты между двумя городами — минимальная цена на каждую дату. Используйте для выбора оптимальной даты перелёта.",
    getCalendarPricesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetCalendarPrices(params) }],
    })),
  );

  server.tool(
    "get_popular_directions",
    "Популярные направления из города — самые дешёвые рейсы по специальным предложениям. Полезно для вдохновения и поиска travel deals.",
    getPopularDirectionsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetPopularDirections(params) }],
    })),
  );

  server.tool(
    "get_airline_directions",
    "Направления конкретной авиакомпании с ценами. Используйте IATA-код авиакомпании (SU = Аэрофлот, S7 = S7, U6 = Уральские). Полезно при лояльности к конкретному перевозчику.",
    getAirlineDirectionsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetAirlineDirections(params) }],
    })),
  );

  server.tool(
    "get_special_offers",
    "Специальные предложения и акционные цены на авиабилеты из города. Возвращает актуальные горящие предложения Travelpayouts.",
    getSpecialOffersSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetSpecialOffers(params) }],
    })),
  );

  server.tool(
    "search_hotels",
    "Поиск отелей в городе или курорте через Hotellook. Возвращает список с ценами, рейтингами и ссылками для бронирования.",
    searchHotelsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSearchHotels(params) }],
    })),
  );

  server.tool(
    "get_hotel_prices",
    "Цены на конкретный отель по hotel_id из Hotellook. Возвращает актуальные тарифы от разных OTA (Booking, Ostrovok и др.).",
    getHotelPricesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetHotelPrices(params) }],
    })),
  );

  server.tool(
    "lookup_airports",
    "Поиск аэропортов по названию города или IATA-коду. Используйте для получения корректных IATA-кодов перед поиском авиабилетов.",
    lookupAirportsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleLookupAirports(params) }],
    })),
  );

  server.tool(
    "lookup_airlines",
    "Справочник авиакомпаний с IATA-кодами. Используйте для получения кода авиакомпании перед вызовом get_airline_directions.",
    lookupAirlinesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleLookupAirlines(params) }],
    })),
  );

  server.tool(
    "lookup_cities",
    "Поиск городов по названию с IATA-кодами. Используйте для получения корректных city-кодов перед поиском авиабилетов.",
    lookupCitiesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleLookupCities(params) }],
    })),
  );

  server.tool(
    "get_direct_routes",
    "Только прямые рейсы без пересадок между двумя городами. Используйте когда клиент явно хочет лететь без пересадок.",
    getDirectRoutesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetDirectRoutes(params) }],
    })),
  );

  server.tool(
    "get_nearest_prices",
    "Цены на авиабилеты в диапазоне ±N дней вокруг указанной даты. Помогает найти дешевле, если дата гибкая (напр. '15-го, но если 14-е дешевле — тоже смотрю').",
    getNearestPricesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetNearestPrices(params) }],
    })),
  );

  return server;
}

export const TOOL_COUNT = 13;
