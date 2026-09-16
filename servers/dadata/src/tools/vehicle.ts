/**
 * Vehicle tools: clean_vehicle, suggest_car_brand.
 *
 * clean_vehicle — Cleaner API (paid)
 * suggest_car_brand — Suggestions API (free)
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { callCleaner, callSuggestions } from "../client.js";
import { success, error, qcToConfidence } from "../lib/formatters.js";
import type { CleanVehicleResult, CarBrandData, SuggestResponse } from "../types.js";

export function registerVehicleTools(server: McpServer): void {
  // --- clean_vehicle ---
  server.tool(
    "clean_vehicle",
    "Recognize car brand and model from a string. Paid: 0.20 RUB/req.",
    {
      vehicle: z
        .string()
        .min(1)
        .max(200)
        .describe("Vehicle description, e.g. 'тойота камри' or 'BMW X5'"),
    },
    withErrorHandling(async (params) => {
      const result = await callCleaner("vehicle", [params.vehicle]);
      if (result.error) return error(result.error);

      const raw = result.data;
      const r: CleanVehicleResult = Array.isArray(raw) ? raw[0] : raw;

      if (!r || !r.result) {
        return success({
          status: "unrecognized",
          message: "Vehicle could not be recognized.",
          source: params.vehicle,
        });
      }

      return success({
        source: r.source,
        result: r.result,
        brand: r.brand,
        model: r.model,
        confidence: qcToConfidence(r.qc),
      });
    }),
  );

  // --- suggest_car_brand ---
  server.tool(
    "suggest_car_brand",
    "Autocomplete car brand names in Russian and English.",
    {
      query: z
        .string()
        .min(1)
        .max(100)
        .describe("Partial car brand name, e.g. 'тойот' or 'BM'"),
      count: z.number().int().min(1).max(20).default(5),
    },
    withErrorHandling(async (params) => {
      const result = await callSuggestions("suggest/car_brand", {
        query: params.query,
        count: params.count,
      });
      if (result.error) return error(result.error);

      const resp = result.data as SuggestResponse<CarBrandData>;
      if (!resp.suggestions?.length) {
        return success({
          status: "no_results",
          message: `No car brands found for "${params.query}".`,
        });
      }

      return success({
        count: resp.suggestions.length,
        brands: resp.suggestions.map((s) => ({
          name: s.value,
          name_ru: s.data.name_ru,
          id: s.data.id,
        })),
      });
    }),
  );
}
