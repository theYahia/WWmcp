/**
 * Geo tools: geolocate_address, ip_locate.
 *
 * Both use the Suggestions API (free, Token-only auth).
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { callSuggestions } from "../client.js";
import { success, error } from "../lib/formatters.js";
import type {
  AddressData,
  SuggestResponse,
  IpLocateResponse,
} from "../types.js";

export function registerGeoTools(server: McpServer): void {
  // --- geolocate_address ---
  server.tool(
    "geolocate_address",
    "Reverse geocoding: find nearest addresses by latitude/longitude coordinates.",
    {
      lat: z.number().min(-90).max(90).describe("Latitude"),
      lon: z.number().min(-180).max(180).describe("Longitude"),
      radius_meters: z
        .number()
        .int()
        .min(1)
        .max(1000)
        .default(100)
        .describe("Search radius in meters (max 1000)"),
      count: z
        .number()
        .int()
        .min(1)
        .max(20)
        .default(5)
        .describe("Number of results"),
    },
    withErrorHandling(async (params) => {
      const result = await callSuggestions("geolocate/address", {
        lat: params.lat,
        lon: params.lon,
        radius_meters: params.radius_meters,
        count: params.count,
      });
      if (result.error) return error(result.error);

      const resp = result.data as SuggestResponse<AddressData>;
      if (!resp.suggestions?.length) {
        return success({
          status: "no_results",
          message: `No addresses found near ${params.lat}, ${params.lon} within ${params.radius_meters}m radius.`,
        });
      }

      return success({
        count: resp.suggestions.length,
        addresses: resp.suggestions.map((s) => ({
          address: s.value,
          postal_code: s.data.postal_code,
          region: s.data.region_with_type,
          city: s.data.city_with_type,
          street: s.data.street_with_type,
          house: s.data.house,
          fias_id: s.data.fias_id,
        })),
      });
    }),
  );

  // --- ip_locate ---
  server.tool(
    "ip_locate",
    "Detect Russian city by IPv4 address. Returns city name, coordinates, and FIAS ID.",
    {
      ip: z
        .string()
        .regex(
          /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
          "Must be a valid IPv4 address (e.g. 46.226.227.20)",
        )
        .describe("IPv4 address to geolocate"),
    },
    withErrorHandling(async (params) => {
      const result = await callSuggestions("iplocate/address", {
        ip: params.ip,
      });
      if (result.error) return error(result.error);

      const resp = result.data as IpLocateResponse;
      if (!resp.location) {
        return success({
          status: "not_found",
          message: `Could not determine location for IP ${params.ip}. It may be a non-Russian or private IP address.`,
        });
      }

      return success({
        ip: params.ip,
        city: resp.location.value,
        region: resp.location.data.region_with_type,
        geo:
          resp.location.data.geo_lat && resp.location.data.geo_lon
            ? {
                lat: resp.location.data.geo_lat,
                lon: resp.location.data.geo_lon,
              }
            : null,
        fias_id: resp.location.data.city_fias_id,
        kladr_id: resp.location.data.kladr_id,
      });
    }),
  );
}
