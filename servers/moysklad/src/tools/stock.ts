import { z } from "zod";
import { moyskladGet } from "../client.js";
import { json, kopToRub, listQuery } from "../lib.js";
import type { ToolDef } from "../types.js";

// MoySklad charges these stock reports 5 rate-limit units each.
const STOCK_WEIGHT = 5;

export const getStockSchema = z.object({
  search: z.string().optional().describe("Search by product name"),
  limit: z.number().int().min(1).max(1000).default(25).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
  group_by: z
    .enum(["product", "variant", "store"])
    .default("product")
    .describe("Group results by product, variant, or store"),
  stock_mode: z
    .enum(["all", "positiveOnly", "negativeOnly", "empty", "nonEmpty"])
    .default("all")
    .describe("Filter by stock level"),
});

export async function handleGetStock(params: z.infer<typeof getStockSchema>): Promise<string> {
  const q = new URLSearchParams();
  q.set("limit", String(params.limit));
  q.set("offset", String(params.offset));
  q.set("groupBy", params.group_by);
  if (params.stock_mode !== "all") q.set("stockMode", params.stock_mode);
  if (params.search) q.set("search", params.search);
  const result = await moyskladGet(`/report/stock/all?${q.toString()}`, STOCK_WEIGHT);
  return formatStock(result);
}

// --- get_stock_by_store ---
export const getStockByStoreSchema = z.object({
  search: z.string().optional().describe("Search by product name"),
  limit: z.number().int().min(1).max(1000).default(25).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});

export async function handleGetStockByStore(params: z.infer<typeof getStockByStoreSchema>): Promise<string> {
  const qs = listQuery({ limit: params.limit, offset: params.offset, search: params.search });
  const result = await moyskladGet(`/report/stock/bystore?${qs}`, STOCK_WEIGHT);
  return formatStockByStore(result);
}

function formatStock(raw: unknown): string {
  const data = (raw ?? {}) as { meta?: { size?: number }; rows?: unknown[] };
  return json({
    total: data.meta?.size,
    items: (data.rows ?? []).map((row) => {
      const s = (row ?? {}) as Record<string, unknown>;
      return {
        name: s.name,
        article: s.article,
        code: s.code,
        stock: s.stock,
        reserve: s.reserve,
        inTransit: s.inTransit,
        quantity: s.quantity,
        sale_price_rubles: kopToRub(s.salePrice),
      };
    }),
  });
}

function formatStockByStore(raw: unknown): string {
  const data = (raw ?? {}) as { meta?: { size?: number }; rows?: unknown[] };
  return json({
    total: data.meta?.size,
    items: (data.rows ?? []).map((row) => {
      const s = (row ?? {}) as Record<string, unknown>;
      const byStore = (s.stockByStore as Array<Record<string, unknown>>) ?? [];
      return {
        name: s.name,
        article: s.article,
        code: s.code,
        by_store: byStore.map((b) => ({
          store: b.name,
          stock: b.stock,
          reserve: b.reserve,
          in_transit: b.inTransit,
          quantity: b.stock,
        })),
      };
    }),
  });
}

export const tools: ToolDef[] = [
  {
    name: "get_stock",
    description: "Get current stock/inventory report from MoySklad. Shows quantities, reserves, and in-transit amounts for each product. Supports grouping by product, variant, or store, and filtering by stock level (positive, negative, empty, non-empty). Paginated.",
    schema: getStockSchema,
    handler: handleGetStock,
  },
  {
    name: "get_stock_by_store",
    description: "Get stock report broken down by warehouse/store. Shows how much of each product is in each store.",
    schema: getStockByStoreSchema,
    handler: handleGetStockByStore,
  },
];
