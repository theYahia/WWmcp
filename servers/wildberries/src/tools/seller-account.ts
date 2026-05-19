/**
 * Seller account tools.
 *
 * Endpoints (verified against WB Seller API public surface):
 *   GET /api/v3/offices            — FBS pickup offices ("warehouses" from FBS perspective)
 *   GET /api/v1/warehouses         — seller's own warehouses (FBO/FBS — distinct from offices)
 *   GET /api/v1/tariffs/commission — commission rates per category (with optional `locale` param)
 *
 * Note: `/api/v1/warehouses` returns sellers' own warehouses for FBS, distinct from
 * `/api/v3/offices` which returns WB-owned pickup points. Both are useful — kept
 * the existing `get_warehouses` (offices) for backward compat and added
 * `get_warehouse_list` for the v1/warehouses surface.
 */
import type { WBClient } from "../client.js";

export const sellerAccountToolDefinitions = {
  get_warehouses: {
    description: "Get list of WB warehouses (FBS pickup offices, /api/v3/offices)",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  get_warehouse_list: {
    description:
      "Get seller's own warehouses (FBO/FBS perspective, /api/v1/warehouses). Different from get_warehouses which returns WB pickup offices.",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  get_commission_rates: {
    description:
      "Get commission rates per category (Wildberries commission %, /api/v1/tariffs/commission). Useful for unit economics & pricing decisions.",
    inputSchema: {
      type: "object" as const,
      properties: {
        locale: {
          type: "string",
          description: "Language locale: 'ru' (default) or 'en'",
        },
      },
    },
  },
} as const;

export type SellerAccountToolName = keyof typeof sellerAccountToolDefinitions;

export async function handleSellerAccountTool(
  client: WBClient,
  name: SellerAccountToolName,
  args: Record<string, unknown>,
): Promise<unknown> {
  switch (name) {
    case "get_warehouses":
      return client.get("/api/v3/offices");

    case "get_warehouse_list":
      return client.get("/api/v1/warehouses");

    case "get_commission_rates": {
      const params: Record<string, string> = {};
      if (args.locale) params.locale = String(args.locale);
      return client.get("/api/v1/tariffs/commission", params);
    }

    default: {
      const _exhaustive: never = name;
      throw new Error(`Unknown seller-account tool: ${String(_exhaustive)}`);
    }
  }
}
