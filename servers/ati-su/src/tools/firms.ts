/**
 * Firm (company) tools: get_firm, search_firms.
 *
 * ATI calls companies "firms". Reputation is a single `score` (stars; NEGATIVE
 * means "red stars" / bad reputation) plus claim/recommendation/mention counts —
 * there is no boolean "verified" and no separate "review_count".
 *
 * NOTE: the real wire types are doc-verified only (no live token), so the
 * outputSchema is permissive (passthrough objects). A type-mismatched-but-valid
 * 200 response must surface its data, not become an SDK output-validation error.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { request } from "../client.js";
import { success, error } from "../lib/formatters.js";
import type { FirmSummary } from "../types.js";

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const;

const firmShape = z.record(z.string(), z.unknown());

function mapFirm(f: FirmSummary) {
  return {
    ati_id: f.ati_id,
    inn: f.inn,
    ogrn: f.ogrn,
    full_name: f.full_name,
    firm_type: f.firm_type,
    address: f.address,
    web_site: f.web_site,
    score: f.score,
    claims_count: f.claims_count,
    recommendations_count: f.recommendations_count,
    bad_partner_mentions_count: f.bad_partner_mentions_count,
    verified_trucks: f.verified_trucks,
    last_month_active_days: f.last_month_active_days,
    registration_date: f.registration_date,
    location: f.location,
  };
}

type FirmSearchResponse =
  | FirmSummary
  | FirmSummary[]
  | { firms?: FirmSummary[]; items?: FirmSummary[] };

/** Normalizes the (unverified) firm-search response into an array, like asLoadArray/asTruckArray. */
function asFirmArray(data: FirmSearchResponse | null): FirmSummary[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as { firms?: FirmSummary[] }).firms)) {
    return (data as { firms: FirmSummary[] }).firms;
  }
  if (Array.isArray((data as { items?: FirmSummary[] }).items)) {
    return (data as { items: FirmSummary[] }).items;
  }
  return Object.keys(data).length ? [data as FirmSummary] : [];
}

export function registerFirmTools(server: McpServer): void {
  server.registerTool(
    "get_firm",
    {
      title: "Get firm summary",
      description:
        "Get a firm's (company's) public summary from ATI.su by its ATI id — reputation " +
        "score (stars; negative = red/bad), claims, recommendations, verified-trucks count, " +
        "registration date, INN/OGRN.",
      inputSchema: {
        ati_id: z.coerce
          .number()
          .int()
          .positive()
          .describe("ATI.su firm id (Код в АТИ), e.g. 123456"),
      },
      outputSchema: { firm: firmShape.optional() },
      annotations: READ_ONLY,
    },
    withErrorHandling(async ({ ati_id }) => {
      // TODO(verify): /v1.0/firms/{atiId}/summary response schema (behind an interactive
      // constructor in docs); field set is from firm-search/contacts-summary siblings.
      const result = await request<FirmSummary>(`/v1.0/firms/${ati_id}/summary`);
      if (result.error) return error(result.error);
      const firm = result.data as FirmSummary | null;
      if (!firm || (firm.ati_id == null && firm.full_name == null)) {
        return error(`Firm ${ati_id} not found or returned an unexpected shape.`);
      }
      return success({ firm: mapFirm(firm) });
    }),
  );

  server.registerTool(
    "search_firms",
    {
      title: "Search firms by INN or phone",
      description:
        "Find a firm on ATI.su by its INN (ИНН) or phone number. ATI does NOT support " +
        "free-text name/city search — only INN or phone lookups.",
      inputSchema: {
        inn: z.string().min(1).max(20).optional().describe("Company INN (ИНН)"),
        phone: z.string().min(1).max(20).optional().describe("Phone number"),
      },
      outputSchema: { total: z.number().optional(), firms: z.array(firmShape).optional() },
      annotations: READ_ONLY,
    },
    withErrorHandling(async ({ inn, phone }) => {
      if (!inn && !phone) {
        return error("Provide either inn or phone — ATI firm search requires one of them.");
      }
      const result = await request<FirmSearchResponse>("/v1.0/firms/search/summary", {
        query: { inn, phone },
      });
      if (result.error) return error(result.error);

      const firms = asFirmArray(result.data);
      return success({ total: firms.length, firms: firms.map(mapFirm) });
    }),
  );
}
