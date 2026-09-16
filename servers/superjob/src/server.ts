/**
 * SuperJob MCP server factory.
 *
 * 5 tools: search_vacancies, get_vacancy, search_employers, get_towns,
 * get_professions.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
import {
  searchVacanciesSchema,
  handleSearchVacancies,
  getVacancySchema,
  handleGetVacancy,
} from "./tools/vacancies.js";
import {
  searchEmployersSchema,
  handleSearchEmployers,
} from "./tools/employers.js";
import { getTownsSchema, handleGetTowns } from "./tools/towns.js";
import {
  getProfessionsSchema,
  handleGetProfessions,
} from "./tools/professions.js";

export const logger = createLogger("superjob-mcp");

export const TOOL_COUNT = 5;

export const VERSION = "1.1.1";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "superjob-mcp",
    version: VERSION,
  });

  // Tool 1: search vacancies
  server.tool(
    "search_vacancies",
    "Поиск вакансий на SuperJob по ключевым словам, городу, зарплате.",
    searchVacanciesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSearchVacancies(params) }],
    })),
  );

  // Tool 2: get vacancy by id
  server.tool(
    "get_vacancy",
    "Полная информация о вакансии SuperJob по ID.",
    getVacancySchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetVacancy(params) }],
    })),
  );

  // Tool 3: search employers
  server.tool(
    "search_employers",
    "Поиск работодателей на SuperJob по названию и городу.",
    searchEmployersSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSearchEmployers(params) }],
    })),
  );

  // Tool 4: get towns/cities
  server.tool(
    "get_towns",
    "Справочник городов SuperJob. Поиск по названию, фильтр по стране.",
    getTownsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetTowns(params) }],
    })),
  );

  // Tool 5: get professions catalogue
  server.tool(
    "get_professions",
    "Справочник профессий/отраслей SuperJob (каталог).",
    getProfessionsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetProfessions(params) }],
    })),
  );

  return server;
}
