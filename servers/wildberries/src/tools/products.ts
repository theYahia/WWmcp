/**
 * Product cards & content tools.
 *
 * Endpoints:
 *   POST /content/v2/get/cards/list   — list seller cards (paginated)
 *   POST /content/v2/get/cards/detail — get card details by nmIDs
 *   POST /api/v2/upload/task          — bulk price updates
 */
import type { WBClient } from "../client.js";

export const productsToolDefinitions = {
  list_products: {
    description: "List seller products (cards) with pagination",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", description: "Number of cards to return (max 100)" },
        cursor: { type: "string", description: "Pagination cursor (updatedAt from previous response)" },
        textSearch: { type: "string", description: "Search text filter" },
      },
    },
  },
  get_product: {
    description: "Get detailed info for specific product cards by nm IDs",
    inputSchema: {
      type: "object" as const,
      properties: {
        nmIDs: {
          type: "array",
          items: { type: "number" },
          description: "Array of nomenclature IDs (max 100)",
        },
      },
      required: ["nmIDs"],
    },
  },
  update_prices: {
    description: "Update product prices",
    inputSchema: {
      type: "object" as const,
      properties: {
        prices: {
          type: "array",
          items: {
            type: "object",
            properties: {
              nmID: { type: "number", description: "Nomenclature ID" },
              price: { type: "number", description: "New price in rubles" },
            },
            required: ["nmID", "price"],
          },
          description: "Array of price updates",
        },
      },
      required: ["prices"],
    },
  },
} as const;

export type ProductsToolName = keyof typeof productsToolDefinitions;

export async function handleProductsTool(
  client: WBClient,
  name: ProductsToolName,
  args: Record<string, unknown>,
): Promise<unknown> {
  switch (name) {
    case "list_products": {
      const body: Record<string, unknown> = {
        settings: {
          cursor: { limit: (args.limit as number) ?? 100 },
          filter: { withPhoto: -1 },
        },
      };
      if (args.cursor) {
        (body.settings as Record<string, unknown>).cursor = {
          limit: (args.limit as number) ?? 100,
          updatedAt: args.cursor,
        };
      }
      if (args.textSearch) {
        (body.settings as Record<string, unknown>).filter = {
          withPhoto: -1,
          textSearch: args.textSearch,
        };
      }
      return client.post("/content/v2/get/cards/list", body);
    }

    case "get_product":
      return client.post("/content/v2/get/cards/detail", { nmIDs: args.nmIDs });

    case "update_prices":
      return client.post("/api/v2/upload/task", { data: args.prices });

    default: {
      const _exhaustive: never = name;
      throw new Error(`Unknown products tool: ${String(_exhaustive)}`);
    }
  }
}
