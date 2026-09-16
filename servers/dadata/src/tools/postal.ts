/**
 * Postal tools: find_postal_unit, suggest_country.
 *
 * Both Suggestions API (free, Token only).
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { callSuggestions } from "../client.js";
import { success, error } from "../lib/formatters.js";
import type { PostalUnitData, CountryData, SuggestResponse } from "../types.js";

export function registerPostalTools(server: McpServer): void {
  // --- find_postal_unit ---
  server.tool(
    "find_postal_unit",
    "Find a post office by postal code, or nearest by coordinates. Returns address, schedule, and status.",
    {
      query: z
        .string()
        .min(1)
        .max(20)
        .describe("Postal code (e.g. '127642') or coordinates"),
      count: z.number().int().min(1).max(20).default(5),
    },
    withErrorHandling(async (params) => {
      const result = await callSuggestions("suggest/postal_unit", {
        query: params.query,
        count: params.count,
      });
      if (result.error) return error(result.error);

      const resp = result.data as SuggestResponse<PostalUnitData>;
      if (!resp.suggestions?.length) {
        return success({
          status: "not_found",
          message: `No postal unit found for "${params.query}".`,
        });
      }

      return success({
        count: resp.suggestions.length,
        postal_units: resp.suggestions.map((s) => ({
          postal_code: s.data.postal_code,
          address: s.data.address_str,
          is_closed: s.data.is_closed,
          geo: s.data.geo_lat != null
            ? { lat: s.data.geo_lat, lon: s.data.geo_lon }
            : null,
          schedule: {
            mon: s.data.schedule_mon,
            tue: s.data.schedule_tue,
            wed: s.data.schedule_wed,
            thu: s.data.schedule_thu,
            fri: s.data.schedule_fri,
            sat: s.data.schedule_sat,
            sun: s.data.schedule_sun,
          },
        })),
      });
    }),
  );

  // --- suggest_country ---
  server.tool(
    "suggest_country",
    "Search countries by name, ISO alpha-2/alpha-3 code. ISO 3166 reference.",
    {
      query: z
        .string()
        .min(1)
        .max(100)
        .describe("Country name or ISO code, e.g. 'Россия', 'RU', 'USA'"),
      count: z.number().int().min(1).max(20).default(5),
    },
    withErrorHandling(async (params) => {
      const result = await callSuggestions("suggest/country", {
        query: params.query,
        count: params.count,
      });
      if (result.error) return error(result.error);

      const resp = result.data as SuggestResponse<CountryData>;
      if (!resp.suggestions?.length) {
        return success({
          status: "no_results",
          message: `No country found for "${params.query}".`,
        });
      }

      return success({
        count: resp.suggestions.length,
        countries: resp.suggestions.map((s) => ({
          name: s.value,
          name_short: s.data.name_short,
          alfa2: s.data.alfa2,
          alfa3: s.data.alfa3,
          code: s.data.code,
        })),
      });
    }),
  );
}
