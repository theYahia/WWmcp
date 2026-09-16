/**
 * Load (cargo) tools.
 *
 *   Reads:  get_load, list_my_loads, search_loads_byboards
 *   Write:  create_load (POST /v2/cargos), gated behind ATI_ALLOW_WRITES + dry_run + confirm
 *
 * ATI has no general "search all published loads" endpoint. Carriers can only
 * search loads on their own Personal boards (search/byboards), and there is no
 * "/loads/my" — you list GET /v1.0/loads and filter by contact_id client-side.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { request } from "../client.js";
import { success, error } from "../lib/formatters.js";
import { config } from "../config.js";
import { resolveCityId } from "./dictionaries.js";
import type { V1Load, V1LoadsResponse, CargoApplicationResponse } from "../types.js";

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const;
const WRITE = {
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: false,
  openWorldHint: true,
} as const;

// Output is permissive (passthrough). Real v1.0 PascalCase wire types are
// doc-verified only (no live token), so a present-but-differently-typed field
// (e.g. a numeric value delivered as a string) must surface its data rather than
// become an SDK output-validation error. mapV1Load still produces clean keys.
const loadShape = z.record(z.string(), z.unknown());

function mapPlace(p: V1Load["Loading"]) {
  if (!p) return undefined;
  return {
    city_id: p.CityId,
    street: p.Street,
    lat: p.Latitude,
    lon: p.Longitude,
    time_start: p.TimeStart,
    time_end: p.TimeEnd,
  };
}

function mapV1Load(l: V1Load) {
  return {
    id: l.Id,
    firm_id: l.FirmId,
    distance: l.Distance, // TODO(verify): unit (km assumed)
    loading: mapPlace(l.Loading),
    unloading: mapPlace(l.Unloading),
    cargo: l.Cargo
      ? {
          weight: l.Cargo.Weight,
          volume: l.Cargo.Volume,
          cargo_type_id: l.Cargo.CargoTypeId,
          cargo_type: l.Cargo.CargoType,
        }
      : undefined,
    payment: l.Payment
      ? {
          currency_id: l.Payment.CurrencyId,
          rate: l.Payment.RateSum,
          with_nds: l.Payment.SumWithNDS,
          without_nds: l.Payment.SumWithoutNDS,
          fixed: l.Payment.FixedRate,
          bargain: l.Payment.Torg,
        }
      : undefined,
    first_date: l.FirstDate,
    last_date: l.LastDate,
    note: l.Note,
    contact_ids: [l.ContactId1, l.ContactId2].filter((x): x is number => x != null),
    added_at: l.AddedAt,
    updated_at: l.UpdatedAt,
  };
}

function asLoadArray(data: V1LoadsResponse | null): V1Load[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Array.isArray(data.loads) ? data.loads : [];
}

/** Accepts a city name OR a numeric id string; resolves to an id. */
async function toCityId(value: string): Promise<number | null> {
  if (/^\d+$/.test(value.trim())) return Number(value.trim());
  return resolveCityId(value);
}

export function registerLoadTools(server: McpServer): void {
  server.registerTool(
    "get_load",
    {
      title: "Get load by id",
      description:
        "Get a single freight load (cargo) by its ATI.su id. Note: this uses the legacy " +
        "v1.0 single-load endpoint, which ATI has marked deprecated.",
      inputSchema: {
        load_id: z
          .string()
          .min(1)
          .max(32)
          .regex(/^[A-Za-z0-9_-]+$/, "Load id must be alphanumeric")
          .describe("ATI.su load id"),
      },
      outputSchema: { load: loadShape.optional() },
      annotations: READ_ONLY,
    },
    withErrorHandling(async ({ load_id }) => {
      const result = await request<V1Load>(`/v1.0/loads/${load_id}`);
      if (result.error) return error(result.error);
      const load = result.data as V1Load | null;
      if (!load || load.Id == null) {
        return error(`Load ${load_id} not found or returned an unexpected shape.`);
      }
      return success({ load: mapV1Load(load) });
    }),
  );

  server.registerTool(
    "list_my_loads",
    {
      title: "List my loads",
      description:
        "List your own freight loads on ATI.su. ATI has no 'my loads' endpoint, so this " +
        "lists your loads (GET /v1.0/loads) and can filter them by contact id client-side.",
      inputSchema: {
        contact_id: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("Filter to loads owned by this contact id"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(200)
          .default(50)
          .describe("Max loads to return"),
      },
      outputSchema: { total: z.number().optional(), loads: z.array(loadShape).optional() },
      annotations: READ_ONLY,
    },
    withErrorHandling(async ({ contact_id, limit }) => {
      // TODO(verify): only the single-load read GET /v1.0/loads/{id} is doc-sourced;
      // the bare GET /v1.0/loads listing (and its array shape) is a community-derived
      // assumption — confirm against a live token, and prefer a v2 listing if one exists.
      const result = await request<V1LoadsResponse>("/v1.0/loads");
      if (result.error) return error(result.error);
      let loads = asLoadArray(result.data);
      if (contact_id != null) {
        loads = loads.filter((l) => l.ContactId1 === contact_id || l.ContactId2 === contact_id);
      }
      const total = loads.length;
      return success({ total, loads: loads.slice(0, limit).map(mapV1Load) });
    }),
  );

  server.registerTool(
    "search_loads_byboards",
    {
      title: "Search loads on my boards",
      description:
        "Search freight loads on your own ATI.su Personal boards (carrier 'search by boards'). " +
        "Requires board ids (find them in the ATI.su web UI). ATI does NOT expose a general " +
        "public load search — only this per-board carrier search.",
      inputSchema: {
        board_ids: z
          .array(z.string().min(1))
          .min(1)
          .describe("Personal board ids to search (24-char strings)"),
        limit: z.number().int().min(1).max(200).default(50).describe("Max loads to return"),
      },
      outputSchema: { total: z.number().optional(), loads: z.array(loadShape).optional() },
      annotations: READ_ONLY,
    },
    withErrorHandling(async ({ board_ids, limit }) => {
      // TODO(verify): exact query-param name(s) for board ids on /v1.0/loads/search/byboards
      // are not exposed in public docs. "board_ids" (comma-joined) is a best guess.
      const result = await request<V1LoadsResponse>("/v1.0/loads/search/byboards", {
        query: { board_ids: board_ids.join(",") },
      });
      if (result.error) return error(result.error);
      const loads = asLoadArray(result.data);
      return success({ total: loads.length, loads: loads.slice(0, limit).map(mapV1Load) });
    }),
  );

  server.registerTool(
    "create_load",
    {
      title: "Create (publish) a load",
      description:
        "Publish a NEW freight load on the live ATI.su exchange (POST /v2/cargos). This is a " +
        "real, public, billable marketplace action. Disabled unless ATI_ALLOW_WRITES=1; even " +
        "then it previews by default (dry_run) and only publishes when dry_run=false AND " +
        "confirm=true.",
      inputSchema: {
        from_city: z.string().min(1).max(200).describe("Origin city name or id"),
        to_city: z.string().min(1).max(200).describe("Destination city name or id"),
        cargo_name: z.string().min(1).max(200).describe("Cargo name/description"),
        weight_tons: z.number().positive().describe("Weight in tons"),
        volume_m3: z.number().positive().describe("Volume in cubic meters"),
        body_type_ids: z
          .array(z.number().int())
          .optional()
          .describe("Acceptable body-type ids (see list_body_types)"),
        loading_date: z.string().max(30).optional().describe("Loading date, YYYY-MM-DD"),
        rate: z.number().nonnegative().optional().describe("Rate with VAT, in the chosen currency"),
        currency_type: z.number().int().optional().describe("Currency id (see list dictionaries)"),
        with_bargaining: z.boolean().default(true).describe("Allow rate bargaining"),
        board_ids: z.array(z.string()).optional().describe("Board ids to publish on"),
        contact_ids: z.array(z.number().int()).optional().describe("Contact ids for this load"),
        note: z.string().max(1000).optional().describe("Free-text note"),
        dry_run: z.boolean().default(true).describe("Preview the assembled payload without sending"),
        confirm: z.boolean().default(false).describe("Must be true (with dry_run=false) to publish"),
      },
      outputSchema: {
        status: z.string().optional(),
        note: z.string().optional(),
        cargo_application: z.record(z.string(), z.unknown()).optional(),
        result: z.record(z.string(), z.unknown()).optional(),
      },
      annotations: WRITE,
    },
    withErrorHandling(async (p) => {
      if (!config.allowWrites) {
        return error(
          "Writing is disabled. Set ATI_ALLOW_WRITES=1 in the server environment to enable create_load.",
        );
      }

      const fromId = await toCityId(p.from_city);
      const toId = await toCityId(p.to_city);
      if (fromId == null) return error(`Could not resolve origin city "${p.from_city}".`);
      if (toId == null) return error(`Could not resolve destination city "${p.to_city}".`);

      // TODO(verify): full /v2/cargos cargo_application schema against a live token.
      const cargo_application = {
        route: {
          loading: {
            location: { type: "manual", city_id: fromId },
            dates: p.loading_date
              ? { type: "from-date", first_date: p.loading_date }
              : { type: "ready" },
            cargos: [
              {
                id: 1,
                name: p.cargo_name,
                weight: { type: "tons", quantity: p.weight_tons },
                volume: { quantity: p.volume_m3 },
              },
            ],
          },
          unloading: { location: { type: "manual", city_id: toId } },
        },
        truck: {
          trucks_count: 1,
          load_type: "ftl",
          body_types: p.body_type_ids ?? [],
        },
        payment: {
          type: p.with_bargaining ? "with-bargaining" : "without-bargaining",
          ...(p.rate != null ? { rate_with_vat: p.rate } : {}),
          ...(p.currency_type != null ? { currency_type: p.currency_type } : {}),
        },
        boards: (p.board_ids ?? []).map((id) => ({ id, publication_mode: "now" })),
        contacts: p.contact_ids ?? [],
        ...(p.note ? { note: p.note } : {}),
      };

      if (p.dry_run) {
        return success({
          status: "dry_run",
          note: "Nothing was sent. Set dry_run=false and confirm=true to publish.",
          cargo_application,
        });
      }
      if (!p.confirm) {
        return success({
          status: "confirmation_required",
          note: "Set confirm=true (with dry_run=false) to publish this load.",
          cargo_application,
        });
      }

      const result = await request<CargoApplicationResponse>("/v2/cargos", {
        method: "POST",
        body: { cargo_application },
        retry: false, // a repeat after 5xx/timeout could publish the same load twice
      });
      if (result.error) return error(result.error);
      return success({ status: "created", result: (result.data ?? {}) as Record<string, unknown> });
    }),
  );
}
