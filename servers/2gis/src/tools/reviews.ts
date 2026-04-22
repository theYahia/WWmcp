/**
 * Reviews tool: get_reviews.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getReviews } from "../client.js";
import { success, error } from "../lib/formatters.js";
import type { ReviewsResponse } from "../types.js";

export function registerReviewsTools(server: McpServer): void {
  server.tool(
    "get_reviews",
    "Get user reviews for a place/branch in 2GIS.",
    {
      place_id: z.string().min(1).describe("2GIS place/branch ID"),
      limit: z.number().int().min(1).max(50).default(10).describe("Max reviews to return"),
    },
    async (params) => {
      const result = await getReviews(params.place_id, params.limit);
      if (result.error) return error(result.error);

      const resp = result.data as ReviewsResponse;
      if (!resp.result?.items?.length) {
        return success({ status: "no_reviews", message: `No reviews found for place ${params.place_id}.` });
      }

      return success({
        total: resp.result.total,
        reviews: resp.result.items.map((r) => ({
          id: r.id,
          rating: r.rating,
          text: r.text,
          date: r.date_created,
          author: r.user?.name,
        })),
      });
    },
  );
}
