import { z } from "zod";
import { moyskladGet } from "../client.js";

export const getStockSchema = z.object({
  search: z.string().optional().describe("Search by product name"),
  limit: z.number().int().min(1).max(1000).default(25).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
  group_by: z.enum(["product", "variant", "store"]).default("product").describe("Group results by product, variant, or store"),
  stock_mode: z.enum(["all", "positiveOnly", "negativeOnly", "empty", "nonEmpty"]).default("all").describe("Filter by stock level"),
});

export async function handleGetStock(params: z.infer<typeof getStockSchema>): Promise<string> {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit));
  query.set("offset", String(params.offset));
  query.set("groupBy", params.group_by);
  if (params.stock_mode !== "all") query.set("stockMode", params.stock_mode);
  if (params.search) query.set("search", params.search);
  const result = await moyskladGet(`/report/stock/all?${query.toString()}`);
  return formatStock(result);
}

function formatStock(raw: unknown): string {
  const data = raw as { meta: { size: number }; rows: Array<Record<string, unknown>> };
  return JSON.stringify({
    total: data.meta?.size,
    items: (data.rows ?? []).map((s) => ({
      name: s.name, article: s.article, code: s.code,
      stock: s.stock, reserve: s.reserve, inTransit: s.inTransit, quantity: s.quantity,
      sale_price_rubles: typeof s.salePrice === "number" ? (s.salePrice as number) / 100 : null,
    })),
  }, null, 2);
}
