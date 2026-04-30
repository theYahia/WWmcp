/**
 * Directions tools: get_directions, suggest.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getDirections, suggest } from "../client.js";
import { success, error } from "../lib/formatters.js";
import type { DirectionsResponse, SuggestResponse } from "../types.js";

export function registerDirectionsTools(server: McpServer): void {
  server.tool(
    "get_directions",
    "Calculate a route between two points using 2GIS routing.",
    {
      origin_lat: z.number().min(-90).max(90).describe("Start latitude"),
      origin_lon: z.number().min(-180).max(180).describe("Start longitude"),
      dest_lat: z.number().min(-90).max(90).describe("Destination latitude"),
      dest_lon: z.number().min(-180).max(180).describe("Destination longitude"),
      mode: z.enum(["driving", "public_transport", "pedestrian", "bicycle", "taxi"]).default("driving")
        .describe("Travel mode"),
    },
    async (params) => {
      const result = await getDirections(
        { lat: params.origin_lat, lon: params.origin_lon },
        { lat: params.dest_lat, lon: params.dest_lon },
        params.mode,
      );
      if (result.error) return error(result.error);

      const resp = result.data as DirectionsResponse;
      if (!resp.result?.length) {
        return success({ status: "no_route", message: "No route found." });
      }

      return success({
        mode: params.mode,
        routes: resp.result.map((r) => ({
          id: r.id,
          type: r.type,
          total_duration_sec: r.total_duration,
          total_distance_m: r.total_distance,
          legs: r.legs?.map((leg) => ({
            distance_m: leg.distance,
            duration_sec: leg.duration,
            steps_count: leg.steps?.length,
          })),
        })),
      });
    },
  );

  server.tool(
    "suggest",
    "Address/place autocomplete using 2GIS suggest API.",
    {
      query: z.string().min(1).max(200).describe("Partial text to autocomplete"),
      lat: z.number().min(-90).max(90).optional().describe("User location latitude for ranking"),
      lon: z.number().min(-180).max(180).optional().describe("User location longitude for ranking"),
    },
    async (params) => {
      const point = params.lat != null && params.lon != null
        ? { lat: params.lat, lon: params.lon }
        : undefined;

      const result = await suggest(params.query, point);
      if (result.error) return error(result.error);

      const resp = result.data as SuggestResponse;
      if (!resp.result?.items?.length) {
        return success({ status: "no_suggestions", message: `No suggestions for "${params.query}".` });
      }

      return success({
        suggestions: resp.result.items.map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          type: item.type,
          point: item.point,
        })),
      });
    },
  );
}
