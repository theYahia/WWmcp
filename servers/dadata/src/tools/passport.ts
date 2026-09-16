/**
 * Passport tools: clean_passport, find_fms_unit.
 *
 * clean_passport — Cleaner API (paid, Token + Secret)
 * find_fms_unit — Suggestions API (free, Token only)
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { callCleaner, callSuggestions } from "../client.js";
import { success, error, qcToConfidence } from "../lib/formatters.js";
import type { CleanPassportResult, FmsUnitData, SuggestResponse } from "../types.js";

export function registerPassportTools(server: McpServer): void {
  // --- clean_passport ---
  server.tool(
    "clean_passport",
    "Validate a Russian passport against the MVD invalid passports registry. Paid: 0.20 RUB/req.",
    {
      passport: z
        .string()
        .min(1)
        .max(20)
        .describe("Passport series and number, e.g. '45 04 346825'"),
    },
    withErrorHandling(async (params) => {
      const result = await callCleaner("passport", [params.passport]);
      if (result.error) return error(result.error);

      const raw = result.data;
      const r: CleanPassportResult = Array.isArray(raw) ? raw[0] : raw;

      if (!r) {
        return success({
          status: "unrecognized",
          message: "Passport could not be parsed.",
          source: params.passport,
        });
      }

      const QC_PASSPORT: Record<number, string> = {
        0: "Valid passport (not in MVD invalid list)",
        1: "Invalid passport (found in MVD invalid list)",
        2: "Empty or garbage input",
        10: "Passport not checked (MVD registry unavailable)",
      };

      return success({
        source: r.source,
        series: r.series,
        number: r.number,
        quality: QC_PASSPORT[r.qc] ?? `Unknown (qc=${r.qc})`,
        is_valid: r.qc === 0,
        confidence: qcToConfidence(r.qc),
      });
    }),
  );

  // --- find_fms_unit ---
  server.tool(
    "find_fms_unit",
    "Find passport issuing authority by subdivision code (e.g. '770-001'). Returns the full name of the office.",
    {
      query: z
        .string()
        .min(1)
        .max(20)
        .describe("FMS subdivision code, e.g. '770-001'"),
      count: z.number().int().min(1).max(20).default(5),
    },
    withErrorHandling(async (params) => {
      const result = await callSuggestions("suggest/fms_unit", {
        query: params.query,
        count: params.count,
      });
      if (result.error) return error(result.error);

      const resp = result.data as SuggestResponse<FmsUnitData>;
      if (!resp.suggestions?.length) {
        return success({
          status: "not_found",
          message: `No FMS unit found for code "${params.query}".`,
        });
      }

      return success({
        count: resp.suggestions.length,
        units: resp.suggestions.map((s) => ({
          code: s.data.code,
          name: s.value,
          region_code: s.data.region_code,
          type: s.data.type,
        })),
      });
    }),
  );

  // --- find_inn_by_passport ---
  server.tool(
    "find_inn_by_passport",
    "Find a person's INN by passport data and birthday (via FNS API). Availability not guaranteed.",
    {
      surname: z.string().min(1).max(100).describe("Surname (фамилия)"),
      name: z.string().min(1).max(100).describe("First name (имя)"),
      patronymic: z.string().max(100).optional().describe("Patronymic (отчество)"),
      birthdate: z.string().regex(/^\d{2}\.\d{2}\.\d{4}$/, "Format: DD.MM.YYYY").describe("Date of birth, DD.MM.YYYY"),
      passport_series: z.string().min(4).max(5).describe("Passport series, e.g. '45 04'"),
      passport_number: z.string().min(6).max(6).describe("Passport number, e.g. '346825'"),
    },
    withErrorHandling(async (params) => {
      // This uses a special DaData endpoint that proxies to FNS
      const body = {
        source: {
          surname: params.surname,
          name: params.name,
          patronymic: params.patronymic ?? "",
          birthdate: params.birthdate,
          passport_series: params.passport_series,
          passport_number: params.passport_number,
        },
      };

      const result = await callSuggestions("findById/party", body);
      if (result.error) {
        return error(
          result.error +
          " Note: this endpoint uses the FNS API which may be temporarily unavailable.",
        );
      }

      if (!result.data) {
        return success({
          status: "not_found",
          message: "INN not found. The FNS API may be temporarily unavailable.",
        });
      }

      return success(result.data);
    }),
  );
}
