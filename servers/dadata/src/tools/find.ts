/**
 * Find tools: find_company_by_id, find_bank, find_by_id_address, find_delivery_city.
 *
 * All use the Suggestions API (free, Token-only auth).
 * findById returns detailed data for a specific entity by its ID.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { callSuggestions } from "../client.js";
import { success, error } from "../lib/formatters.js";
import { formatCompany } from "./suggest.js";
import type {
  PartyData,
  BankData,
  AddressData,
  DeliveryData,
  SuggestResponse,
} from "../types.js";

export function registerFindTools(server: McpServer): void {
  // --- find_company_by_id ---
  server.tool(
    "find_company_by_id",
    "Get detailed company info by INN or OGRN. Returns registration, status, CEO, address, OKVED.",
    {
      query: z
        .string()
        .min(1)
        .max(15)
        .describe("Company INN (10 or 12 digits) or OGRN (13 or 15 digits)"),
      branch_type: z
        .enum(["MAIN", "BRANCH"])
        .optional()
        .describe("Filter by branch type"),
      kpp: z
        .string()
        .max(9)
        .optional()
        .describe("KPP to find a specific branch"),
    },
    withErrorHandling(async (params) => {
      const body: Record<string, unknown> = { query: params.query };
      if (params.branch_type) body.branch_type = params.branch_type;
      if (params.kpp) body.kpp = params.kpp;

      const result = await callSuggestions("findById/party", body);
      if (result.error) return error(result.error);

      const resp = result.data as SuggestResponse<PartyData>;
      if (!resp.suggestions?.length) {
        return success({
          status: "not_found",
          message: `No company found for "${params.query}". Check that the INN/OGRN is correct.`,
        });
      }

      return success(formatCompany(resp.suggestions[0].data));
    }),
  );

  // --- find_bank ---
  server.tool(
    "find_bank",
    "Find bank by BIC, SWIFT, INN, or name. Returns correspondent account, address, and status.",
    {
      query: z
        .string()
        .min(1)
        .max(300)
        .describe("Bank BIC, SWIFT code, INN, or name"),
      count: z.number().int().min(1).max(20).default(5),
    },
    withErrorHandling(async (params) => {
      const result = await callSuggestions("suggest/bank", {
        query: params.query,
        count: params.count,
      });
      if (result.error) return error(result.error);

      const resp = result.data as SuggestResponse<BankData>;
      if (!resp.suggestions?.length) {
        return success({
          status: "not_found",
          message: `No bank found for "${params.query}".`,
        });
      }

      return success({
        count: resp.suggestions.length,
        banks: resp.suggestions.map((s) => ({
          name: s.data.name?.payment ?? s.data.name?.short ?? null,
          full_name: s.data.name?.full ?? null,
          bic: s.data.bic,
          swift: s.data.swift,
          inn: s.data.inn,
          kpp: s.data.kpp,
          correspondent_account: s.data.correspondent_account,
          registration_number: s.data.registration_number,
          address: s.data.address?.value ?? null,
          status: s.data.state?.status ?? null,
          type: s.data.opf?.type ?? null,
        })),
      });
    }),
  );

  // --- find_by_id_address ---
  server.tool(
    "find_by_id_address",
    "Get full address info by FIAS ID, KLADR ID, or cadastral number.",
    {
      query: z
        .string()
        .min(1)
        .max(100)
        .describe("FIAS ID (UUID), KLADR ID, or cadastral number"),
    },
    withErrorHandling(async (params) => {
      const result = await callSuggestions("findById/address", {
        query: params.query,
      });
      if (result.error) return error(result.error);

      const resp = result.data as SuggestResponse<AddressData>;
      if (!resp.suggestions?.length) {
        return success({
          status: "not_found",
          message: `No address found for ID "${params.query}".`,
        });
      }

      const s = resp.suggestions[0];
      return success({
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
        fias_id: s.data.fias_id,
        kladr_id: s.data.kladr_id,
        timezone: s.data.timezone,
      });
    }),
  );

  // --- find_delivery_city ---
  server.tool(
    "find_delivery_city",
    "Get CDEK, Boxberry, and DPD city IDs by KLADR ID. Essential for logistics integrations.",
    {
      query: z
        .string()
        .min(1)
        .max(20)
        .describe("KLADR ID of the city (e.g. '7700000000000')"),
    },
    withErrorHandling(async (params) => {
      const result = await callSuggestions("findById/delivery", {
        query: params.query,
      });
      if (result.error) return error(result.error);

      const resp = result.data as SuggestResponse<DeliveryData>;
      if (!resp.suggestions?.length) {
        return success({
          status: "not_found",
          message: `No delivery city found for KLADR "${params.query}". Use suggest_address first to get the KLADR ID.`,
        });
      }

      const d = resp.suggestions[0].data;
      return success({
        kladr_id: d.kladr_id,
        fias_id: d.fias_id,
        cdek_id: d.cdek_id,
        boxberry_id: d.boxberry_id,
        dpd_id: d.dpd_id,
      });
    }),
  );
}
