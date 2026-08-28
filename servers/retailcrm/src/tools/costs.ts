import { z } from "zod";
import { retailCrmGet, retailCrmPost } from "../client.js";
import { ok, runTool, type ToolResult } from "../format/index.js";
import { dateField, siteField, pageField, limitField } from "./common.js";

// ── list_costs ───────────────────────────────────────────────
export const listCostsSchema = z.object({
  filter_date_from: dateField("Costs created on/after (YYYY-MM-DD)").optional(),
  filter_date_to: dateField("Costs created on/before (YYYY-MM-DD)").optional(),
  filter_cost_groups: z.string().optional().describe("Filter by cost group code"),
  page: pageField,
  limit: limitField,
});

export async function handleListCosts(params: z.infer<typeof listCostsSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const query: Record<string, string> = { page: String(params.page), limit: String(params.limit) };
    if (params.filter_date_from) query["filter[createdAtFrom]"] = params.filter_date_from;
    if (params.filter_date_to) query["filter[createdAtTo]"] = params.filter_date_to;
    if (params.filter_cost_groups) query["filter[costGroups][]"] = params.filter_cost_groups;
    const result = await retailCrmGet("/costs", query);
    return ok(result);
  });
}

// ── create_cost ──────────────────────────────────────────────
export const createCostSchema = z.object({
  summ: z.number().describe("Cost amount"),
  cost_item: z.string().describe("Cost item code (expense category)"),
  date_from: dateField("Cost period start (YYYY-MM-DD)"),
  date_to: dateField("Cost period end (YYYY-MM-DD)").optional(),
  order_id: z.number().int().optional().describe("Attribute the cost to an order RetailCRM ID"),
  comment: z.string().optional().describe("Free-text comment"),
  site: siteField,
});

export async function handleCreateCost(params: z.infer<typeof createCostSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const cost: Record<string, unknown> = {
      summ: params.summ,
      costItem: params.cost_item,
      dateFrom: params.date_from,
      dateTo: params.date_to ?? params.date_from,
    };
    if (params.order_id !== undefined) cost.order = { id: params.order_id };
    if (params.comment) cost.comment = params.comment;
    const form: Record<string, string> = { cost: JSON.stringify(cost) };
    if (params.site) form.site = params.site;
    const result = await retailCrmPost("/costs/create", form);
    return ok(result);
  });
}
