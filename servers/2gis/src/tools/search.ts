/**
 * Search tools: search_places, get_place, search_by_rubric.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { searchItems, getItem, searchByRubric } from "../client.js";
import { success, error } from "../lib/formatters.js";
import type { SearchResponse } from "../types.js";

export function registerSearchTools(server: McpServer): void {
  server.tool(
    "search_places",
    "Search for places, businesses, and points of interest in 2GIS.",
    {
      query: z.string().min(1).max(200).describe("Search query (e.g. 'кофейня', 'аптека рядом')"),
      point: z.string().regex(/^-?\d+\.?\d*,-?\d+\.?\d*$/).optional()
        .describe("Center point as 'lon,lat' for spatial search"),
      radius: z.number().int().min(100).max(50000).default(5000)
        .describe("Search radius in meters"),
      type: z.enum(["building", "street", "branch", "org", "adm_div"]).optional()
        .describe("Filter by item type"),
      fields: z.string().optional()
        .describe("Additional fields: items.point,items.address,items.contact_groups,items.schedule,items.reviews"),
      page_size: z.number().int().min(1).max(50).default(10).describe("Results per page"),
    },
    async (params) => {
      const searchParams: Record<string, string> = {
        q: params.query,
        page_size: String(params.page_size),
        fields: params.fields || "items.point,items.address,items.contact_groups,items.rubrics",
      };
      if (params.point) {
        searchParams.point = params.point;
        searchParams.radius = String(params.radius);
      }
      if (params.type) searchParams.type = params.type;

      const result = await searchItems(searchParams);
      if (result.error) return error(result.error);

      const resp = result.data as SearchResponse;
      if (!resp.result?.items?.length) {
        return success({ status: "no_results", message: `No places found for "${params.query}".` });
      }

      return success({
        total: resp.result.total,
        items: resp.result.items.map((item) => ({
          id: item.id,
          name: item.name,
          full_name: item.full_name,
          type: item.type,
          address: item.address_name,
          point: item.point,
          rubrics: item.rubrics?.map((r) => r.name),
          phones: item.contact_groups?.flatMap((g) =>
            g.contacts.filter((c) => c.type === "phone").map((c) => c.value)
          ),
          rating: item.reviews?.general_rating,
          review_count: item.reviews?.general_review_count,
        })),
      });
    },
  );

  server.tool(
    "get_place",
    "Get detailed information about a specific place by its 2GIS ID.",
    {
      place_id: z.string().min(1).describe("2GIS place/branch ID"),
      fields: z.string().default("items.point,items.address,items.contact_groups,items.schedule,items.reviews,items.rubrics,items.external_content")
        .describe("Fields to retrieve"),
    },
    async (params) => {
      const result = await getItem(params.place_id, params.fields);
      if (result.error) return error(result.error);

      const resp = result.data as SearchResponse;
      const item = resp.result?.items?.[0];
      if (!item) {
        return success({ status: "not_found", message: `Place ${params.place_id} not found.` });
      }

      return success({
        id: item.id,
        name: item.name,
        full_name: item.full_name,
        type: item.type,
        address: item.address_name,
        point: item.point,
        rubrics: item.rubrics?.map((r) => r.name),
        schedule: item.schedule,
        phones: item.contact_groups?.flatMap((g) =>
          g.contacts.filter((c) => c.type === "phone").map((c) => c.value)
        ),
        websites: item.contact_groups?.flatMap((g) =>
          g.contacts.filter((c) => c.type === "website").map((c) => c.value)
        ),
        rating: item.reviews?.general_rating,
        review_count: item.reviews?.general_review_count,
        photos: item.external_content
          ?.filter((e) => e.type === "photo")
          .map((e) => ({ count: e.count, main_url: e.main_photo_url })),
      });
    },
  );

  server.tool(
    "search_by_rubric",
    "Search places by rubric (category) ID near a location.",
    {
      rubric_id: z.string().min(1).describe("2GIS rubric ID"),
      point: z.string().regex(/^-?\d+\.?\d*,-?\d+\.?\d*$/)
        .describe("Center point as 'lon,lat'"),
      radius: z.number().int().min(100).max(50000).default(5000)
        .describe("Search radius in meters"),
    },
    async (params) => {
      const result = await searchByRubric(params.rubric_id, params.point, params.radius);
      if (result.error) return error(result.error);

      const resp = result.data as SearchResponse;
      if (!resp.result?.items?.length) {
        return success({ status: "no_results", message: `No places found for rubric ${params.rubric_id}.` });
      }

      return success({
        total: resp.result.total,
        items: resp.result.items.map((item) => ({
          id: item.id,
          name: item.name,
          address: item.address_name,
          point: item.point,
          phones: item.contact_groups?.flatMap((g) =>
            g.contacts.filter((c) => c.type === "phone").map((c) => c.value)
          ),
        })),
      });
    },
  );
}
