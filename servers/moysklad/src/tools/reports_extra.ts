import { z } from "zod";
import { moyskladGet } from "../client.js";
import { buildFilter, formatList, json, kopToRub, listQuery } from "../lib.js";
import type { ToolDef } from "../types.js";

// --- get_dashboard ---
export const getDashboardSchema = z.object({
  period: z.enum(["day", "week", "month"]).default("day").describe("Aggregation period for the dashboard metrics"),
});
export async function handleGetDashboard(p: z.infer<typeof getDashboardSchema>): Promise<string> {
  // Money figures in the dashboard are in kopecks (per MoySklad).
  const result = await moyskladGet(`/report/dashboard/${p.period}`);
  return json(result);
}

// --- get_turnover (обороты товаров) ---
export const getTurnoverSchema = z.object({
  moment_from: z.string().optional().describe("Start date, ISO 8601 (e.g. 2024-01-01)"),
  moment_to: z.string().optional().describe("End date, ISO 8601 (e.g. 2024-12-31)"),
  limit: z.number().int().min(1).max(1000).default(25).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});
export async function handleGetTurnover(p: z.infer<typeof getTurnoverSchema>): Promise<string> {
  const filter = buildFilter([
    ["momentFrom", p.moment_from ? `${p.moment_from} 00:00:00` : ""],
    ["momentTo", p.moment_to ? `${p.moment_to} 23:59:59` : ""],
  ]);
  const qs = listQuery({ limit: p.limit, offset: p.offset, filter });
  const result = await moyskladGet(`/report/turnover/all?${qs}`);
  const section = (s: unknown) => {
    const x = (s ?? {}) as Record<string, unknown>;
    return { quantity: x.quantity, sum_rubles: kopToRub(x.sum) };
  };
  return formatList(result, "items", (row) => {
    const assortment = row.assortment as Record<string, unknown> | undefined;
    return {
      product_name: assortment?.name ?? null,
      on_period_start: section(row.onPeriodStart),
      income: section(row.income),
      outcome: section(row.outcome),
      on_period_end: section(row.onPeriodEnd),
    };
  });
}

// --- get_money_report (остатки денег по счетам/кассам) ---
export const getMoneyReportSchema = z.object({});
export async function handleGetMoneyReport(): Promise<string> {
  const result = await moyskladGet("/report/money/byaccount");
  return formatList(result, "accounts", (row) => {
    const account = row.account as Record<string, unknown> | undefined;
    const org = row.organization as Record<string, unknown> | undefined;
    return {
      account: account?.name ?? (account ? "bank account" : "cash"),
      organization: org?.name ?? null,
      balance_rubles: kopToRub(row.balance),
    };
  });
}

// --- get_stock_current (fast current stock) ---
export const getStockCurrentSchema = z.object({
  store_href: z.string().optional().describe("Limit to one warehouse (meta href). Omit for all."),
});
export async function handleGetStockCurrent(p: z.infer<typeof getStockCurrentSchema>): Promise<string> {
  const q = new URLSearchParams();
  if (p.store_href) q.set("filter", `store=${p.store_href}`);
  const suffix = q.toString() ? `?${q.toString()}` : "";
  // The "current" endpoints are the lightweight, non-paginated stock reports.
  const result = await moyskladGet(`/report/stock/all/current${suffix}`);
  return json(result);
}

export const tools: ToolDef[] = [
  {
    name: "get_dashboard",
    description: "Get dashboard metrics (sales, orders, money) for a day/week/month. Money values are in kopecks.",
    schema: getDashboardSchema,
    handler: handleGetDashboard,
  },
  {
    name: "get_turnover",
    description: "Get product turnover (обороты) over a period: opening, income, outcome, closing. Sums in RUBLES.",
    schema: getTurnoverSchema,
    handler: handleGetTurnover,
  },
  {
    name: "get_money_report",
    description: "Get current money balances by bank account and cash register. Balances in RUBLES.",
    schema: getMoneyReportSchema,
    handler: handleGetMoneyReport,
  },
  {
    name: "get_stock_current",
    description: "Fast current stock report (assortment id -> stock), optionally for one warehouse.",
    schema: getStockCurrentSchema,
    handler: handleGetStockCurrent,
  },
];
