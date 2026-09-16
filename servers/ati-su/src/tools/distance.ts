/**
 * Distance tool: get_distance.
 *
 * ATI.su distance calculation is a PAID API (access granted on request):
 * POST /gw/gis-rm/v1/distance with route nodes (by city id or coordinates).
 * Disabled unless ATI_ENABLE_DISTANCE=1.
 *
 * The API is id-based, so city names are resolved to ids first; coordinates can
 * be supplied directly to bypass geocoding. Responses are in meters/seconds; we
 * also surface km/hours for convenience.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { request } from "../client.js";
import { success, error } from "../lib/formatters.js";
import { config } from "../config.js";
import { resolveCityId } from "./dictionaries.js";
import type { DistanceResponse } from "../types.js";

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const;

type Node = { node_id: number } | { geo_point: { lat: number; lon: number } };

/** Coerces an unverified API value to a finite number, or undefined. */
function num(x: unknown): number | undefined {
  const n = typeof x === "number" ? x : typeof x === "string" ? Number(x) : NaN;
  return Number.isFinite(n) ? n : undefined;
}

async function buildNode(
  city: string,
  lat: number | undefined,
  lon: number | undefined,
): Promise<Node | { error: string }> {
  if ((lat != null) !== (lon != null)) {
    return { error: "Provide BOTH lat and lon for a point, or neither." };
  }
  if (lat != null && lon != null) return { geo_point: { lat, lon } };
  if (/^\d+$/.test(city.trim())) return { node_id: Number(city.trim()) };
  const id = await resolveCityId(city);
  if (id == null) return { error: `Could not resolve city "${city}" to an ATI.su id.` };
  return { node_id: id };
}

export function registerDistanceTools(server: McpServer): void {
  server.registerTool(
    "get_distance",
    {
      title: "Distance between two points (paid)",
      description:
        "Compute road distance and travel time between two points on ATI.su. Uses the PAID " +
        "distance API — enable with ATI_ENABLE_DISTANCE=1 (access is granted by ATI on " +
        "request). Accepts city names/ids, or lat/lon coordinates to bypass geocoding.",
      inputSchema: {
        from_city: z.string().min(1).max(200).describe("Origin city name or id"),
        to_city: z.string().min(1).max(200).describe("Destination city name or id"),
        from_lat: z.number().optional().describe("Origin latitude (overrides from_city)"),
        from_lon: z.number().optional().describe("Origin longitude (overrides from_city)"),
        to_lat: z.number().optional().describe("Destination latitude (overrides to_city)"),
        to_lon: z.number().optional().describe("Destination longitude (overrides to_city)"),
      },
      outputSchema: {
        distance_km: z.number().optional(),
        travel_time_hours: z.number().optional(),
        total_distance_m: z.number().optional(),
        travel_time_s: z.number().optional(),
        toll_distance: z.number().optional(),
        platon_distance: z.number().optional(),
      },
      annotations: READ_ONLY,
    },
    withErrorHandling(async (p) => {
      if (!config.enableDistance) {
        return error(
          "The distance API is a paid ATI.su feature and is disabled. Set ATI_ENABLE_DISTANCE=1 " +
            "(after obtaining access from ATI.su) to enable get_distance.",
        );
      }

      const from = await buildNode(p.from_city, p.from_lat, p.from_lon);
      if ("error" in from) return error(from.error);
      const to = await buildNode(p.to_city, p.to_lat, p.to_lon);
      if ("error" in to) return error(to.error);

      const result = await request<DistanceResponse>("/gw/gis-rm/v1/distance", {
        method: "POST",
        body: { nodes: [from, to] },
      });
      if (result.error) return error(result.error);

      const d = (result.data ?? {}) as DistanceResponse;
      const meters = num(d.total_distance);
      const seconds = num(d.travel_time);
      return success({
        distance_km: meters != null ? Math.round(meters / 100) / 10 : undefined,
        travel_time_hours: seconds != null ? Math.round(seconds / 36) / 100 : undefined,
        total_distance_m: meters,
        travel_time_s: seconds,
        toll_distance: num(d.toll_distance),
        platon_distance: num(d.platon_distance),
      });
    }),
  );
}
