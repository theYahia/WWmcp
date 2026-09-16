/**
 * Reference-data tools: categories, countries, languages.
 *
 * These return the valid codes that the `category` / `country` / `language`
 * filters of search_channels and search_posts accept.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { apiGet } from "../client.js";
import { fromResult } from "../lib/formatters.js";

const lang = z.enum(["ru", "en"]).default("ru").describe("Response language for names");

export function registerDatabaseTools(server: McpServer): void {
  server.tool(
    "list_categories",
    "List available channel category codes (use as the `category` filter in search).",
    { lang },
    withErrorHandling(async (params) => fromResult(await apiGet("/database/categories", { lang: params.lang }))),
  );

  server.tool(
    "list_countries",
    "List available country codes (use as the `country` filter in search).",
    { lang },
    withErrorHandling(async (params) => fromResult(await apiGet("/database/countries", { lang: params.lang }))),
  );

  server.tool(
    "list_languages",
    "List available language codes (use as the `language` filter in search).",
    { lang },
    withErrorHandling(async (params) => fromResult(await apiGet("/database/languages", { lang: params.lang }))),
  );
}
