/**
 * Analytics tools — ABC analysis, sales velocity, returns, competitor pricing.
 *
 * Endpoints / data sources:
 *   GET /api/v1/supplier/reportDetailByPeriod
 *     — drives ABC analysis, returns stats, and sales velocity (when nm_id filter applied client-side)
 *   GET /api/v1/supplier/sales
 *     — fallback for per-SKU sales over a recent window (older data)
 *
 * Public WB catalog (no auth, used by WB front-end):
 *   GET https://search.wb.ru/exactmatch/ru/common/v4/search
 *     — competitor price intelligence (returns name, price (priceU/1000), rating, feedbacks, supplierID)
 *
 * Notes:
 *   - WB does not (as of 2026-04) expose a dedicated returns endpoint. Returns
 *     are inferred from `reportDetailByPeriod` rows where `doc_type_name` indicates
 *     a return (`Возврат` / negative `quantity`).
 *   - `get_competitor_prices` hits the PUBLIC catalog, so no Bearer token is sent
 *     and it bypasses the rate limiter. Use sparingly.
 */
import type { WBClient } from "../client.js";

// ---------- Public catalog fetcher (no auth) ----------

const PUBLIC_CATALOG_URL = "https://search.wb.ru/exactmatch/ru/common/v4/search";

interface PublicCatalogProduct {
  id: number;
  name: string;
  brand: string;
  supplierId?: number;
  priceU?: number; // price in kopecks before discount
  salePriceU?: number; // price in kopecks after discount
  rating?: number;
  feedbacks?: number;
}

interface PublicCatalogResponse {
  data?: {
    products?: PublicCatalogProduct[];
  };
}

async function fetchPublicCatalog(
  query: string,
  category: string | undefined,
  limit: number,
): Promise<PublicCatalogProduct[]> {
  const params = new URLSearchParams({
    appType: "1",
    curr: "rub",
    dest: "-1257786", // Moscow (most common destination ID; affects shown prices)
    query,
    resultset: "catalog",
    sort: "popular",
    spp: "30",
    suppressSpellcheck: "false",
  });
  if (category) {
    params.set("xsubject", category);
  }
  const url = `${PUBLIC_CATALOG_URL}?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; wildberries-mcp)",
    },
  });
  if (!response.ok) {
    throw new Error(`Public catalog returned ${response.status}`);
  }
  const json = (await response.json()) as PublicCatalogResponse;
  const products = json.data?.products ?? [];
  return products.slice(0, limit);
}

// ---------- Tool definitions ----------

export const analyticsToolDefinitions = {
  get_statistics: {
    description: "Get detailed sales statistics report by period",
    inputSchema: {
      type: "object" as const,
      properties: {
        dateFrom: { type: "string", description: "Start date (RFC3339)" },
        dateTo: { type: "string", description: "End date (RFC3339)" },
        limit: { type: "number", description: "Number of records" },
        rrdid: { type: "number", description: "Pagination cursor (last rrd_id from previous response)" },
      },
      required: ["dateFrom", "dateTo"],
    },
  },
  get_abc_analysis: {
    description:
      "Compute ABC analysis of products by sales revenue. A = top 20% products generating 80% revenue, B = next 15%, C = bottom 5%. Use this to identify best-selling and slow-moving items.",
    inputSchema: {
      type: "object" as const,
      properties: {
        dateFrom: { type: "string", description: "Start date (RFC3339, e.g. 2025-01-01T00:00:00Z)" },
        dateTo: { type: "string", description: "End date (RFC3339)" },
      },
      required: ["dateFrom", "dateTo"],
    },
  },
  get_sales_velocity: {
    description:
      "Compute sales velocity (avg units sold per day) for a given nm_id or SKU over the last N days. Useful for restock planning and inventory turnover.",
    inputSchema: {
      type: "object" as const,
      properties: {
        nmId: {
          type: "number",
          description: "Nomenclature ID to analyze (omit to aggregate across all SKUs)",
        },
        days: {
          type: "number",
          description: "Period length in days (default 30, max 90)",
        },
      },
    },
  },
  get_competitor_prices: {
    description:
      "Query the public Wildberries catalog (no auth) for competitor price intelligence. Returns name, price, brand, rating, feedback count, and supplierId for the top matching products. Use to benchmark your prices.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Search query (product keyword)",
        },
        category: {
          type: "string",
          description: "Optional xsubject ID (WB category filter)",
        },
        limit: {
          type: "number",
          description: "Max products to return (default 20, max 100)",
        },
      },
      required: ["query"],
    },
  },
  get_returns_stats: {
    description:
      "Compute return rate statistics for a period. Returns total orders, total returns, return rate %, and a per-SKU breakdown of returns. Pulls from reportDetailByPeriod and infers returns via doc_type_name / negative quantity.",
    inputSchema: {
      type: "object" as const,
      properties: {
        dateFrom: { type: "string", description: "Start date (RFC3339)" },
        dateTo: { type: "string", description: "End date (RFC3339)" },
      },
      required: ["dateFrom", "dateTo"],
    },
  },
} as const;

export type AnalyticsToolName = keyof typeof analyticsToolDefinitions;

// ---------- Internal helpers ----------

interface ReportRow {
  nm_id: number;
  sa_name?: string;
  retail_amount?: number;
  quantity?: number;
  doc_type_name?: string;
  rr_dt?: string; // realisation date
}

async function fetchFullReport(
  client: WBClient,
  dateFrom: string,
  dateTo: string,
): Promise<ReportRow[]> {
  const params: Record<string, string> = {
    dateFrom,
    dateTo,
    limit: "100000",
    rrdid: "0",
  };
  const raw = await client.get<{ data?: ReportRow[] }>(
    "/api/v1/supplier/reportDetailByPeriod",
    params,
  );
  return raw.data ?? [];
}

// ---------- Tool handlers ----------

export async function handleAnalyticsTool(
  client: WBClient,
  name: AnalyticsToolName,
  args: Record<string, unknown>,
): Promise<unknown> {
  switch (name) {
    case "get_statistics": {
      const params: Record<string, string> = {
        dateFrom: args.dateFrom as string,
        dateTo: args.dateTo as string,
      };
      if (args.limit) params.limit = String(args.limit);
      if (args.rrdid) params.rrdid = String(args.rrdid);
      return client.get("/api/v1/supplier/reportDetailByPeriod", params);
    }

    case "get_abc_analysis": {
      const rows = await fetchFullReport(
        client,
        args.dateFrom as string,
        args.dateTo as string,
      );

      // Group by nm_id, sum retail_amount
      const grouped = new Map<number, { name: string; revenue: number; orders: number }>();
      for (const row of rows) {
        const existing = grouped.get(row.nm_id);
        if (existing) {
          existing.revenue += row.retail_amount ?? 0;
          existing.orders += row.quantity ?? 0;
        } else {
          grouped.set(row.nm_id, {
            name: row.sa_name ?? String(row.nm_id),
            revenue: row.retail_amount ?? 0,
            orders: row.quantity ?? 0,
          });
        }
      }

      const items = Array.from(grouped.entries())
        .map(([nmId, v]) => ({ nmId, ...v }))
        .sort((a, b) => b.revenue - a.revenue);

      const totalRevenue = items.reduce((s, i) => s + i.revenue, 0);

      let cumulative = 0;
      const result = items.map((item) => {
        cumulative += item.revenue;
        const cumulativeShare = totalRevenue > 0 ? cumulative / totalRevenue : 0;
        const abcClass = cumulativeShare <= 0.8 ? "A" : cumulativeShare <= 0.95 ? "B" : "C";
        return {
          nmId: item.nmId,
          name: item.name,
          revenue: Math.round(item.revenue),
          orders: item.orders,
          revenueShare:
            totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 10000) / 100 : 0,
          class: abcClass,
        };
      });

      const summary = {
        A: result.filter((i) => i.class === "A").length,
        B: result.filter((i) => i.class === "B").length,
        C: result.filter((i) => i.class === "C").length,
        totalProducts: result.length,
        totalRevenue: Math.round(totalRevenue),
      };

      return { summary, items: result };
    }

    case "get_sales_velocity": {
      const days = Math.min(Math.max((args.days as number | undefined) ?? 30, 1), 90);
      const dateTo = new Date();
      const dateFrom = new Date(dateTo.getTime() - days * 24 * 60 * 60 * 1000);
      const rows = await fetchFullReport(
        client,
        dateFrom.toISOString(),
        dateTo.toISOString(),
      );

      const nmIdFilter = args.nmId as number | undefined;
      const relevant = nmIdFilter !== undefined
        ? rows.filter((r) => r.nm_id === nmIdFilter)
        : rows;

      // Only count sales (positive quantity, exclude returns)
      const sales = relevant.filter((r) => {
        const q = r.quantity ?? 0;
        const isReturn =
          (r.doc_type_name ?? "").toLowerCase().includes("возврат") || q < 0;
        return !isReturn && q > 0;
      });

      const totalUnits = sales.reduce((s, r) => s + (r.quantity ?? 0), 0);
      const totalRevenue = sales.reduce((s, r) => s + (r.retail_amount ?? 0), 0);
      const unitsPerDay = days > 0 ? totalUnits / days : 0;
      const revenuePerDay = days > 0 ? totalRevenue / days : 0;

      // Per-SKU breakdown (top 20 by units)
      const bySku = new Map<number, { name: string; units: number; revenue: number }>();
      for (const r of sales) {
        const existing = bySku.get(r.nm_id);
        if (existing) {
          existing.units += r.quantity ?? 0;
          existing.revenue += r.retail_amount ?? 0;
        } else {
          bySku.set(r.nm_id, {
            name: r.sa_name ?? String(r.nm_id),
            units: r.quantity ?? 0,
            revenue: r.retail_amount ?? 0,
          });
        }
      }
      const breakdown = Array.from(bySku.entries())
        .map(([nmId, v]) => ({
          nmId,
          name: v.name,
          units: v.units,
          unitsPerDay: Math.round((v.units / days) * 100) / 100,
          revenue: Math.round(v.revenue),
        }))
        .sort((a, b) => b.units - a.units)
        .slice(0, 20);

      return {
        period: { dateFrom: dateFrom.toISOString(), dateTo: dateTo.toISOString(), days },
        nmIdFilter: nmIdFilter ?? null,
        summary: {
          totalUnits,
          totalRevenue: Math.round(totalRevenue),
          unitsPerDay: Math.round(unitsPerDay * 100) / 100,
          revenuePerDay: Math.round(revenuePerDay),
        },
        topSkus: breakdown,
      };
    }

    case "get_competitor_prices": {
      const query = args.query as string;
      const category = args.category as string | undefined;
      const limit = Math.min(Math.max((args.limit as number | undefined) ?? 20, 1), 100);

      const products = await fetchPublicCatalog(query, category, limit);

      const items = products.map((p) => ({
        nmId: p.id,
        name: p.name,
        brand: p.brand,
        supplierId: p.supplierId ?? null,
        priceRubles: p.priceU !== undefined ? Math.round(p.priceU / 100) : null,
        salePriceRubles: p.salePriceU !== undefined ? Math.round(p.salePriceU / 100) : null,
        rating: p.rating ?? null,
        feedbacks: p.feedbacks ?? 0,
      }));

      const prices = items
        .map((i) => i.salePriceRubles ?? i.priceRubles)
        .filter((p): p is number => p !== null && p > 0);
      const summary = prices.length
        ? {
            count: items.length,
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices),
            avgPrice: Math.round(prices.reduce((s, p) => s + p, 0) / prices.length),
            medianPrice: prices.slice().sort((a, b) => a - b)[Math.floor(prices.length / 2)],
          }
        : { count: 0, minPrice: null, maxPrice: null, avgPrice: null, medianPrice: null };

      return { query, category: category ?? null, summary, items };
    }

    case "get_returns_stats": {
      const rows = await fetchFullReport(
        client,
        args.dateFrom as string,
        args.dateTo as string,
      );

      let totalOrders = 0;
      let totalReturns = 0;
      let returnRevenue = 0;
      let salesRevenue = 0;
      const returnsBySku = new Map<
        number,
        { name: string; returns: number; orders: number }
      >();

      for (const row of rows) {
        const q = row.quantity ?? 0;
        const amount = row.retail_amount ?? 0;
        const docType = (row.doc_type_name ?? "").toLowerCase();
        const isReturn = docType.includes("возврат") || q < 0;

        const existing = returnsBySku.get(row.nm_id) ?? {
          name: row.sa_name ?? String(row.nm_id),
          returns: 0,
          orders: 0,
        };

        if (isReturn) {
          const absQ = Math.abs(q);
          totalReturns += absQ;
          returnRevenue += Math.abs(amount);
          existing.returns += absQ;
        } else if (q > 0) {
          totalOrders += q;
          salesRevenue += amount;
          existing.orders += q;
        }
        returnsBySku.set(row.nm_id, existing);
      }

      const returnRate = totalOrders > 0 ? (totalReturns / totalOrders) * 100 : 0;

      const breakdown = Array.from(returnsBySku.entries())
        .map(([nmId, v]) => ({
          nmId,
          name: v.name,
          orders: v.orders,
          returns: v.returns,
          returnRate: v.orders > 0 ? Math.round((v.returns / v.orders) * 10000) / 100 : 0,
        }))
        .filter((r) => r.returns > 0)
        .sort((a, b) => b.returnRate - a.returnRate)
        .slice(0, 50);

      return {
        period: { dateFrom: args.dateFrom, dateTo: args.dateTo },
        summary: {
          totalOrders,
          totalReturns,
          returnRate: Math.round(returnRate * 100) / 100,
          salesRevenue: Math.round(salesRevenue),
          returnRevenue: Math.round(returnRevenue),
        },
        topReturned: breakdown,
      };
    }

    default: {
      const _exhaustive: never = name;
      throw new Error(`Unknown analytics tool: ${String(_exhaustive)}`);
    }
  }
}
