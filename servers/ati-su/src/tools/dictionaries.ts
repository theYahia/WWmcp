/**
 * Dictionary tools: list_body_types, list_cargo_types, resolve_city.
 *
 * Also exports resolveCityId() — the API is id-based, so city NAMES must be
 * resolved to ids before they can be used by id-only endpoints (e.g. distance).
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { request } from "../client.js";
import { success, error } from "../lib/formatters.js";
import type { DictionaryItem, ParsedLocation } from "../types.js";

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const;

// Permissive: carTypes/cargoTypes wire types are doc-verified only (no live token),
// so a differently-typed field must not fail SDK output validation. mapDictItem
// still emits clean keys (id/guid/name/name_en/short_name).
const dictItemShape = z.record(z.string(), z.unknown());

function mapDictItem(d: DictionaryItem) {
  return { id: d.Id, guid: d.Id2, name: d.Name, name_en: d.NameEng, short_name: d.ShortName };
}

// --- city name → id resolution (shared helper) ---

const cityCache = new Map<string, number>();

/**
 * Resolves a city name to an ATI city id via POST /v1.0/dictionaries/locations/parse.
 * Returns null if it cannot be resolved. Result is cached per process.
 * TODO(verify): exact request body field ("query") and response shape.
 */
export async function resolveCityId(name: string): Promise<number | null> {
  const key = name.trim().toLowerCase();
  if (!key) return null;
  const cached = cityCache.get(key);
  if (cached !== undefined) return cached;

  const result = await request<ParsedLocation | ParsedLocation[]>(
    "/v1.0/dictionaries/locations/parse",
    { method: "POST", body: { query: name } },
  );
  if (result.error || !result.data) return null;

  const first = Array.isArray(result.data) ? result.data[0] : result.data;
  const id = first?.city_id;
  if (typeof id === "number") {
    cityCache.set(key, id);
    return id;
  }
  return null;
}

/** Test/maintenance helper: clears the city-id cache. */
export function clearCityCache(): void {
  cityCache.clear();
}

export function registerDictionaryTools(server: McpServer): void {
  server.registerTool(
    "list_body_types",
    {
      title: "List truck body types",
      description:
        "Returns the ATI.su truck body-type dictionary (тент, рефрижератор, бортовой, …) " +
        "with their numeric ids. Use these ids when filtering trucks or creating loads.",
      inputSchema: {},
      outputSchema: { total: z.number().optional(), items: z.array(dictItemShape).optional() },
      annotations: READ_ONLY,
    },
    withErrorHandling(async () => {
      const result = await request<DictionaryItem[]>("/v1.0/dictionaries/carTypes");
      if (result.error) return error(result.error);
      const items = Array.isArray(result.data) ? result.data : [];
      return success({ total: items.length, items: items.map(mapDictItem) });
    }),
  );

  server.registerTool(
    "list_cargo_types",
    {
      title: "List cargo types",
      description:
        "Returns the ATI.su cargo-type dictionary with numeric ids, used when describing or " +
        "filtering loads.",
      inputSchema: {},
      outputSchema: { total: z.number().optional(), items: z.array(dictItemShape).optional() },
      annotations: READ_ONLY,
    },
    withErrorHandling(async () => {
      const result = await request<DictionaryItem[]>("/v1.0/dictionaries/cargoTypes");
      if (result.error) return error(result.error);
      const items = Array.isArray(result.data) ? result.data : [];
      return success({ total: items.length, items: items.map(mapDictItem) });
    }),
  );

  server.registerTool(
    "resolve_city",
    {
      title: "Resolve city name to ATI id",
      description:
        "Resolves a Russian city name (e.g. 'Москва') to its ATI.su numeric city id. " +
        "Most ATI endpoints — including distance and search filters — require ids, not names.",
      inputSchema: { name: z.string().min(1).max(200).describe("City name, e.g. 'Москва'") },
      outputSchema: {
        name: z.string().optional(),
        city_id: z.number().optional(),
        resolved: z.boolean().optional(),
      },
      annotations: READ_ONLY,
    },
    withErrorHandling(async ({ name }) => {
      const id = await resolveCityId(name);
      if (id === null) {
        return error(`Could not resolve city "${name}" to an ATI.su city id.`);
      }
      return success({ name, city_id: id, resolved: true });
    }),
  );
}
