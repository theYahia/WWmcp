/**
 * Geocoding tools: geocode, reverse_geocode.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { geocodeAddress, reverseGeocode } from "../client.js";
import { success, error } from "../lib/formatters.js";
import type { GeocodeResponse } from "../types.js";

export function registerGeocodingTools(server: McpServer): void {
  server.tool(
    "geocode",
    "Convert a text address to geographic coordinates using 2GIS geocoder.",
    {
      address: z.string().min(1).max(300).describe("Address to geocode (e.g. 'Москва, ул. Ленина, 1')"),
    },
    async (params) => {
      const result = await geocodeAddress(params.address);
      if (result.error) return error(result.error);

      const resp = result.data as GeocodeResponse;
      if (!resp.result?.items?.length) {
        return success({ status: "no_results", message: `No results for "${params.address}".` });
      }

      return success({
        total: resp.result.total,
        results: resp.result.items.map((item) => ({
          id: item.id,
          name: item.name,
          full_name: item.full_name,
          type: item.type,
          coordinates: item.point,
          address_components: item.address?.components,
          postcode: item.address?.postcode,
        })),
      });
    },
  );

  server.tool(
    "reverse_geocode",
    "Convert coordinates to an address using 2GIS reverse geocoder.",
    {
      lat: z.number().min(-90).max(90).describe("Latitude"),
      lon: z.number().min(-180).max(180).describe("Longitude"),
    },
    async (params) => {
      const result = await reverseGeocode(params.lat, params.lon);
      if (result.error) return error(result.error);

      const resp = result.data as GeocodeResponse;
      if (!resp.result?.items?.length) {
        return success({ status: "no_results", message: `No address found at ${params.lat}, ${params.lon}.` });
      }

      return success({
        coordinates: { lat: params.lat, lon: params.lon },
        results: resp.result.items.map((item) => ({
          id: item.id,
          name: item.name,
          full_name: item.full_name,
          type: item.type,
          address_components: item.address?.components,
        })),
      });
    },
  );
}
