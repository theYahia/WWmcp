/**
 * Suggest tools: suggest_address, suggest_company.
 *
 * Both use the Suggestions API (free, 10K req/day, Token-only auth).
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { callSuggestions } from "../client.js";
import {
  success,
  error,
  QC_GEO,
  COMPANY_STATUS,
  epochToDate,
} from "../lib/formatters.js";
import type {
  AddressData,
  PartyData,
  FioData,
  SuggestResponse,
} from "../types.js";

// ---------------------------------------------------------------------------
// Shared company formatter — also exported for find.ts
// ---------------------------------------------------------------------------

export function formatCompany(d: PartyData) {
  return {
    name: d.name?.short_with_opf ?? d.name?.full_with_opf ?? null,
    full_name: d.name?.full_with_opf ?? null,
    inn: d.inn,
    kpp: d.kpp,
    ogrn: d.ogrn,
    registration_date: epochToDate(d.ogrn_date),
    type: d.type,
    opf: d.opf?.short ?? null,
    status: d.state?.status ?? null,
    status_description: d.state?.status
      ? (COMPANY_STATUS[d.state.status] ?? d.state.status)
      : null,
    liquidation_date: epochToDate(d.state?.liquidation_date),
    ceo: d.management?.name ?? null,
    ceo_title: d.management?.post ?? null,
    address: d.address?.value ?? null,
    okved: d.okved ?? null,
    employees: d.employee_count ?? null,
    branches: d.branch_count ?? null,
    branch_type: d.branch_type ?? null,
    finance: d.finance
      ? {
          tax_system: d.finance.tax_system,
          income: d.finance.income,
          expense: d.finance.expense,
        }
      : null,
  };
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerSuggestTools(server: McpServer): void {
  // --- suggest_address ---
  server.tool(
    "suggest_address",
    "Autocomplete Russian addresses. Returns suggestions with postal code, FIAS ID, and coordinates.",
    {
      query: z
        .string()
        .min(1)
        .max(300)
        .describe("Partial address in any format"),
      count: z
        .number()
        .int()
        .min(1)
        .max(20)
        .default(5)
        .describe("Number of suggestions (1-20)"),
      language: z
        .enum(["ru", "en"])
        .default("ru")
        .describe("Response language"),
      from_bound: z
        .enum([
          "country",
          "region",
          "area",
          "city",
          "settlement",
          "street",
          "house",
        ])
        .optional()
        .describe("Minimum granularity level"),
      to_bound: z
        .enum([
          "country",
          "region",
          "area",
          "city",
          "settlement",
          "street",
          "house",
        ])
        .optional()
        .describe("Maximum granularity level"),
      locations: z
        .array(z.record(z.string(), z.string()))
        .max(10)
        .optional()
        .describe(
          'Filter by region/city KLADR/FIAS IDs, e.g. [{"region_fias_id":"..."}]',
        ),
    },
    withErrorHandling(async (params) => {
      const body: Record<string, unknown> = {
        query: params.query,
        count: params.count,
        language: params.language,
      };
      if (params.from_bound) body.from_bound = { value: params.from_bound };
      if (params.to_bound) body.to_bound = { value: params.to_bound };
      if (params.locations) body.locations = params.locations;

      const result = await callSuggestions("suggest/address", body);
      if (result.error) return error(result.error);

      const resp = result.data as SuggestResponse<AddressData>;
      if (!resp.suggestions?.length) {
        return success({
          status: "no_results",
          message: `No addresses found for "${params.query}". Try a shorter or broader query.`,
        });
      }

      return success({
        count: resp.suggestions.length,
        suggestions: resp.suggestions.map((s) => ({
          address: s.value,
          postal_code: s.data.postal_code,
          region: s.data.region_with_type,
          city: s.data.city_with_type,
          settlement: s.data.settlement_with_type,
          street: s.data.street_with_type,
          house: s.data.house,
          flat: s.data.flat,
          geo:
            s.data.geo_lat && s.data.geo_lon
              ? { lat: s.data.geo_lat, lon: s.data.geo_lon }
              : null,
          geo_quality:
            s.data.qc_geo != null
              ? (QC_GEO[s.data.qc_geo] ?? `Unknown (qc_geo=${s.data.qc_geo})`)
              : null,
          fias_id: s.data.fias_id,
          kladr_id: s.data.kladr_id,
          timezone: s.data.timezone,
        })),
      });
    }),
  );

  // --- suggest_company ---
  server.tool(
    "suggest_company",
    "Search Russian companies by name, INN, or OGRN. Returns legal details, address, and CEO.",
    {
      query: z
        .string()
        .min(1)
        .max(300)
        .describe("Company name, INN, or OGRN"),
      count: z.number().int().min(1).max(20).default(5),
      status: z
        .array(
          z.enum([
            "ACTIVE",
            "LIQUIDATING",
            "LIQUIDATED",
            "BANKRUPT",
            "REORGANIZING",
          ]),
        )
        .optional()
        .describe("Filter by company status"),
      type: z
        .enum(["LEGAL", "INDIVIDUAL"])
        .optional()
        .describe("LEGAL = companies, INDIVIDUAL = sole proprietors"),
    },
    withErrorHandling(async (params) => {
      const body: Record<string, unknown> = {
        query: params.query,
        count: params.count,
      };
      if (params.status) body.status = params.status;
      if (params.type) body.type = params.type;

      const result = await callSuggestions("suggest/party", body);
      if (result.error) return error(result.error);

      const resp = result.data as SuggestResponse<PartyData>;
      if (!resp.suggestions?.length) {
        return success({
          status: "no_results",
          message: `No companies found for "${params.query}".`,
        });
      }

      return success({
        count: resp.suggestions.length,
        companies: resp.suggestions.map((s) => formatCompany(s.data)),
      });
    }),
  );

  // --- suggest_fio ---
  server.tool(
    "suggest_fio",
    "Autocomplete Russian full names (FIO). Returns suggestions with gender detection.",
    {
      query: z
        .string()
        .min(1)
        .max(300)
        .describe("Partial name, e.g. 'Иван' or 'Иванов Ив'"),
      count: z.number().int().min(1).max(20).default(5),
      parts: z
        .array(z.enum(["SURNAME", "NAME", "PATRONYMIC"]))
        .optional()
        .describe("Which parts to suggest. Omit for full FIO"),
      gender: z
        .enum(["MALE", "FEMALE", "UNKNOWN"])
        .optional()
        .describe("Filter by gender"),
    },
    withErrorHandling(async (params) => {
      const body: Record<string, unknown> = {
        query: params.query,
        count: params.count,
      };
      if (params.parts) body.parts = params.parts;
      if (params.gender) body.gender = params.gender;

      const result = await callSuggestions("suggest/fio", body);
      if (result.error) return error(result.error);

      const resp = result.data as SuggestResponse<FioData>;
      if (!resp.suggestions?.length) {
        return success({
          status: "no_results",
          message: `No name suggestions for "${params.query}".`,
        });
      }

      const GENDER_MAP: Record<string, string> = {
        MALE: "Male",
        FEMALE: "Female",
        UNKNOWN: "Undetermined",
      };

      return success({
        count: resp.suggestions.length,
        suggestions: resp.suggestions.map((s) => ({
          value: s.value,
          surname: s.data.surname,
          name: s.data.name,
          patronymic: s.data.patronymic,
          gender: s.data.gender,
          gender_label: GENDER_MAP[s.data.gender] ?? s.data.gender,
        })),
      });
    }),
  );
}
