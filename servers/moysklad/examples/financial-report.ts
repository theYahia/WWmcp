/**
 * examples/financial-report.ts
 *
 * Use case: end-of-month P&L by counterparty.
 *
 * The native get_profit_report breaks down by product, not counterparty.
 * To get a per-customer P&L we:
 *
 *   1. Page through customer orders for the month (get_orders, multiple
 *      pages).
 *   2. Group by agent.
 *   3. Cross-reference each agent's order sum with the product-level profit
 *      report to estimate margin.
 *
 * This recipe is designed for a monthly LLM-driven close, replacing what
 * would otherwise be a manual Excel export.
 */

interface MonthlyClose {
  year: number;
  month: number; // 1..12
}

function isoStart({ year, month }: MonthlyClose): string {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

function isoEnd({ year, month }: MonthlyClose): string {
  // Last day of the month — naive but adequate for MoySklad's momentTo filter
  // which already handles 23:59:59 padding in get_profit_report.
  const next = new Date(Date.UTC(year, month, 0));
  return `${year}-${String(month).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
}

/**
 * Step 1 — Pull product-level P&L for the month.
 *
 * MCP call:
 *   get_profit_report {
 *     moment_from: "<first of month>",
 *     moment_to:   "<last of month>",
 *     limit: 1000
 *   }
 *
 * Returns: items[] with sell_quantity, sell_sum_rubles, sell_cost_sum_rubles,
 * profit_rubles, margin per product. Sum across products to get monthly P&L.
 */
function productPnL(period: MonthlyClose) {
  return {
    tool: "get_profit_report",
    args: { moment_from: isoStart(period), moment_to: isoEnd(period), limit: 1000 },
  };
}

/**
 * Step 2 — Pull all customer orders for the same period (paginated).
 *
 * MCP calls (loop until result.total <= offset+limit):
 *   get_orders {
 *     limit: 1000,
 *     offset: <i * 1000>,
 *     order: "moment,asc",
 *     expand: "agent",     // pull counterparty name inline
 *   }
 *
 * For each order, group orders[].sum_rubles by agent.id.
 */
function paginateOrders(period: MonthlyClose, offset: number) {
  return {
    tool: "get_orders",
    args: { limit: 1000, offset, order: "moment,asc", expand: "agent" },
    filter_hint: `moment >= ${isoStart(period)} AND moment <= ${isoEnd(period)} 23:59:59`,
  };
}

/**
 * Step 3 — Synthesise per-counterparty P&L.
 *
 * In-memory aggregation only — no MCP call. Produce a table:
 *
 *   { agent_id, agent_name, total_orders, total_sales_rubles, est_profit_rubles }
 *
 * `est_profit_rubles` = agent_sales × global_margin (from step 1). For a
 * precise per-counterparty margin you'd need MoySklad's paid "Прибыль по
 * покупателям" report which isn't exposed via REST.
 */

export function financialReportRecipe(period: MonthlyClose) {
  return {
    description:
      "Build a monthly P&L grouped by counterparty by combining the product-level " +
      "profit report with paginated customer orders.",
    phases: [
      { name: "product_pnl", call: productPnL(period) },
      { name: "orders_page_0", call: paginateOrders(period, 0) },
      { name: "orders_page_N", note: "Loop until offset >= meta.size." },
      { name: "aggregate", note: "Group orders by agent.id; multiply by global margin from step 1." },
    ],
    notes: [
      "MoySklad does NOT expose per-counterparty profit via REST in the free plan.",
      "This recipe approximates by applying the global product margin uniformly.",
      "For precise per-counterparty P&L, upgrade to MoySklad's paid analytics module.",
    ],
  };
}
