/**
 * Stock & inventory tools.
 *
 * Endpoints:
 *   PUT  /api/v3/stocks/{warehouseId} — bulk stock update
 *   POST /api/v3/stocks/{warehouseId} — query current stock levels
 */
import type { WBClient } from "../client.js";

export const stockToolDefinitions = {
  update_stocks: {
    description: "Update product stocks at a specific warehouse",
    inputSchema: {
      type: "object" as const,
      properties: {
        warehouseId: { type: "number", description: "Warehouse ID" },
        stocks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              sku: { type: "string", description: "Barcode/SKU" },
              amount: { type: "number", description: "Stock quantity" },
            },
            required: ["sku", "amount"],
          },
          description: "Array of stock updates",
        },
      },
      required: ["warehouseId", "stocks"],
    },
  },
  get_stocks: {
    description: "Get current stock levels for a specific warehouse",
    inputSchema: {
      type: "object" as const,
      properties: {
        warehouseId: { type: "number", description: "Warehouse ID (use get_warehouses to get IDs)" },
        skus: {
          type: "array",
          items: { type: "string" },
          description: "Array of barcodes/SKUs to check (leave empty for all stocks)",
        },
      },
      required: ["warehouseId"],
    },
  },
} as const;

export type StockToolName = keyof typeof stockToolDefinitions;

export async function handleStockTool(
  client: WBClient,
  name: StockToolName,
  args: Record<string, unknown>,
): Promise<unknown> {
  switch (name) {
    case "update_stocks": {
      const warehouseId = args.warehouseId as number;
      return client.put(`/api/v3/stocks/${warehouseId}`, { stocks: args.stocks });
    }

    case "get_stocks": {
      const warehouseId = args.warehouseId as number;
      const skus = (args.skus as string[] | undefined) ?? [];
      // WB API v3: POST /api/v3/stocks/{warehouseId} with skus array
      // Empty array returns all stocks for the warehouse
      return client.post(`/api/v3/stocks/${warehouseId}`, { skus });
    }

    default: {
      const _exhaustive: never = name;
      throw new Error(`Unknown stock tool: ${String(_exhaustive)}`);
    }
  }
}
