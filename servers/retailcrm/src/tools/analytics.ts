import { z } from "zod";
import { retailCrmGet } from "../client.js";
import { ok, runTool, type ToolResult } from "../format/index.js";
import { dateField } from "./common.js";
import type { RawOrder } from "../types.js";

// ── get_orders_summary ───────────────────────────────────────
// Genuinely period-scoped: exact count via pagination.totalCount, plus
// status distribution / revenue / AOV aggregated over the fetched window.
export const getOrdersSummarySchema = z.object({
  date_from: dateField("Start date for the summary period (YYYY-MM-DD)"),
  date_to: dateField("End date for the summary period (YYYY-MM-DD)"),
  filter_status: z.string().optional().describe("Restrict the summary to a single status code"),
  max_pages: z.number().int().min(1).max(20).default(5)
    .describe("Pages of 100 orders to aggregate (revenue/status are computed over this window; the count is always exact)"),
});

export async function handleGetOrdersSummary(params: z.infer<typeof getOrdersSummarySchema>): Promise<ToolResult> {
  return runTool(async () => {
    const collected: RawOrder[] = [];
    let totalCount = 0;
    let totalPages = 1;

    for (let page = 1; page <= params.max_pages; page++) {
      const query: Record<string, string> = {
        "filter[createdAtFrom]": params.date_from,
        "filter[createdAtTo]": params.date_to,
        limit: "100",
        page: String(page),
      };
      if (params.filter_status) query["filter[status]"] = params.filter_status;

      const resp = await retailCrmGet("/orders", query) as {
        orders?: RawOrder[];
        pagination?: { totalCount?: number; totalPageCount?: number };
      };
      const orders = resp.orders ?? [];
      collected.push(...orders);
      totalCount = resp.pagination?.totalCount ?? totalCount;
      totalPages = resp.pagination?.totalPageCount ?? totalPages;
      if (page >= totalPages || orders.length === 0) break;
    }

    const byStatus: Record<string, number> = {};
    let revenue = 0;
    for (const o of collected) {
      const s = o.status ?? "unknown";
      byStatus[s] = (byStatus[s] ?? 0) + 1;
      revenue += o.totalSumm ?? 0;
    }
    const aggregatedOver = collected.length;
    const averageOrderValue = aggregatedOver ? Math.round((revenue / aggregatedOver) * 100) / 100 : 0;

    return ok({
      period: { from: params.date_from, to: params.date_to },
      totalCount,
      aggregatedOver,
      partial: totalCount > aggregatedOver,
      revenue,
      averageOrderValue,
      byStatus,
    });
  });
}

// ── get_customers_summary ────────────────────────────────────
export const getCustomersSummarySchema = z.object({
  date_from: dateField("Start date (YYYY-MM-DD)"),
  date_to: dateField("End date (YYYY-MM-DD)"),
});

export async function handleGetCustomersSummary(params: z.infer<typeof getCustomersSummarySchema>): Promise<ToolResult> {
  return runTool(async () => {
    const resp = await retailCrmGet("/customers", {
      "filter[dateFrom]": params.date_from,
      "filter[dateTo]": params.date_to,
      limit: "1",
    }) as { pagination?: { totalCount?: number } };

    return ok({
      period: { from: params.date_from, to: params.date_to },
      newCustomers: resp.pagination?.totalCount ?? 0,
    });
  });
}
