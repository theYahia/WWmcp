import { z } from "zod";
import { moyskladGet } from "../client.js";

export const getProfitReportSchema = z.object({
  limit: z.number().int().min(1).max(1000).default(25).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
  moment_from: z.string().optional().describe("Start date, ISO 8601 (e.g. 2024-01-01)"),
  moment_to: z.string().optional().describe("End date, ISO 8601 (e.g. 2024-12-31)"),
});

export async function handleGetProfitReport(params: z.infer<typeof getProfitReportSchema>): Promise<string> {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit));
  query.set("offset", String(params.offset));
  const filters: string[] = [];
  if (params.moment_from) filters.push(`momentFrom=${params.moment_from} 00:00:00`);
  if (params.moment_to) filters.push(`momentTo=${params.moment_to} 23:59:59`);
  if (filters.length) query.set("filter", filters.join(";"));
  const result = await moyskladGet(`/report/profit/byproduct?${query.toString()}`);
  return formatProfitReport(result);
}

function formatProfitReport(raw: unknown): string {
  const data = raw as { meta: { size: number }; rows: Array<Record<string, unknown>> };
  return JSON.stringify({
    total: data.meta?.size,
    items: (data.rows ?? []).map((r) => {
      const assortment = r.assortment as Record<string, unknown> | undefined;
      return {
        product_name: assortment?.name ?? null,
        sell_quantity: r.sellQuantity,
        sell_sum_rubles: typeof r.sellSum === "number" ? (r.sellSum as number) / 100 : null,
        sell_cost_sum_rubles: typeof r.sellCostSum === "number" ? (r.sellCostSum as number) / 100 : null,
        return_quantity: r.returnQuantity,
        return_sum_rubles: typeof r.returnSum === "number" ? (r.returnSum as number) / 100 : null,
        profit_rubles: typeof r.profit === "number" ? (r.profit as number) / 100 : null,
        margin: r.margin,
      };
    }),
  }, null, 2);
}
