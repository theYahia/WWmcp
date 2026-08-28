import { z } from "zod";
import { retailCrmGet } from "../client.js";
import { ok, runTool, presentProductList, type ToolResult } from "../format/index.js";
import { rawField, pageField, limitField } from "./common.js";

// ── list_products ────────────────────────────────────────────
export const listProductsSchema = z.object({
  filter_name: z.string().optional().describe("Filter by product name (partial match)"),
  filter_active: z.boolean().optional().describe("Filter by active status (true = active only)"),
  filter_groups: z.string().optional().describe("Filter by product group ID (see list_product_groups)"),
  filter_min_price: z.number().optional().describe("Minimum price filter"),
  filter_max_price: z.number().optional().describe("Maximum price filter"),
  raw: rawField,
  page: pageField,
  limit: limitField,
});

export async function handleListProducts(params: z.infer<typeof listProductsSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const query: Record<string, string> = { page: String(params.page), limit: String(params.limit) };
    if (params.filter_name) query["filter[name]"] = params.filter_name;
    if (params.filter_active !== undefined) query["filter[active]"] = params.filter_active ? "1" : "0";
    if (params.filter_groups) query["filter[groups][]"] = params.filter_groups;
    if (params.filter_min_price !== undefined) query["filter[minPrice]"] = String(params.filter_min_price);
    if (params.filter_max_price !== undefined) query["filter[maxPrice]"] = String(params.filter_max_price);

    const result = await retailCrmGet("/store/products", query);
    if (params.raw) return ok(result);
    return ok(presentProductList(result));
  });
}

// ── list_product_groups ──────────────────────────────────────
export const listProductGroupsSchema = z.object({
  filter_active: z.boolean().optional().describe("Filter by active status"),
  filter_parent_group: z.string().optional().describe("Restrict to children of this parent group ID"),
  page: pageField,
  limit: limitField,
});

export async function handleListProductGroups(params: z.infer<typeof listProductGroupsSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const query: Record<string, string> = { page: String(params.page), limit: String(params.limit) };
    if (params.filter_active !== undefined) query["filter[active]"] = params.filter_active ? "1" : "0";
    if (params.filter_parent_group) query["filter[parentGroup]"] = params.filter_parent_group;
    const result = await retailCrmGet("/store/product-groups", query);
    return ok(result);
  });
}
