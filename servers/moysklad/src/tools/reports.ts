import { z } from "zod";
import { moyskladGet } from "../client.js";
import { buildFilter, json, kopToRub, listQuery } from "../lib.js";
import type { ToolDef } from "../types.js";

const periodSchema = {
  limit: z.number().int().min(1).max(1000).default(25).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
  moment_from: z.string().optional().describe("Start date, ISO 8601 (e.g. 2024-01-01)"),
  moment_to: z.string().optional().describe("End date, ISO 8601 (e.g. 2024-12-31)"),
};

function periodFilter(from?: string, to?: string): string | undefined {
  return buildFilter([
    ["momentFrom", from ? `${from} 00:00:00` : ""],
    ["momentTo", to ? `${to} 23:59:59` : ""],
  ]);
}

// --- get_profit_report ---
export const getProfitReportSchema = z.object(periodSchema);

export async function handleGetProfitReport(params: z.infer<typeof getProfitReportSchema>): Promise<string> {
  const filter = periodFilter(params.moment_from, params.moment_to);
  const qs = listQuery({ limit: params.limit, offset: params.offset, filter });
  const result = await moyskladGet(`/report/profit/byproduct?${qs}`);
  return formatProfitReport(result);
}

// --- get_sales_report ---
export const getSalesReportSchema = z.object(periodSchema);

export async function handleGetSalesReport(params: z.infer<typeof getSalesReportSchema>): Promise<string> {
  const filter = periodFilter(params.moment_from, params.moment_to);
  const qs = listQuery({ limit: params.limit, offset: params.offset, filter });
  const result = await moyskladGet(`/report/sales/byproduct?${qs}`);
  return formatSalesReport(result);
}

function formatProfitReport(raw: unknown): string {
  const data = (raw ?? {}) as { meta?: { size?: number }; rows?: unknown[] };
  return json({
    total: data.meta?.size,
    items: (data.rows ?? []).map((row) => {
      const r = (row ?? {}) as Record<string, unknown>;
      const assortment = r.assortment as Record<string, unknown> | undefined;
      return {
        product_name: assortment?.name ?? null,
        sell_quantity: r.sellQuantity,
        sell_sum_rubles: kopToRub(r.sellSum),
        sell_cost_sum_rubles: kopToRub(r.sellCostSum),
        return_quantity: r.returnQuantity,
        return_sum_rubles: kopToRub(r.returnSum),
        profit_rubles: kopToRub(r.profit),
        margin: r.margin,
      };
    }),
  });
}

function formatSalesReport(raw: unknown): string {
  const data = (raw ?? {}) as { meta?: { size?: number }; rows?: unknown[] };
  return json({
    total: data.meta?.size,
    items: (data.rows ?? []).map((row) => {
      const r = (row ?? {}) as Record<string, unknown>;
      const assortment = r.assortment as Record<string, unknown> | undefined;
      return {
        product_name: assortment?.name ?? null,
        sell_quantity: r.sellQuantity,
        sell_sum_rubles: kopToRub(r.sellSum),
      };
    }),
  });
}

export const tools: ToolDef[] = [
  {
    name: "get_profit_report",
    description: "Get profit report by product. Shows sales, costs, returns, profit, margin.",
    schema: getProfitReportSchema,
    handler: handleGetProfitReport,
  },
  {
    name: "get_sales_report",
    description: "Get sales report by product. Shows quantities sold and revenue.",
    schema: getSalesReportSchema,
    handler: handleGetSalesReport,
  },
];
