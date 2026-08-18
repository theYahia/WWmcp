import { z } from "zod";
import { retailCrmGet } from "../client.js";
import { ok, runTool, type ToolResult } from "../format/index.js";
import { siteField, pageField, limitField } from "./common.js";

// ── store_inventories ────────────────────────────────────────
export const storeInventoriesSchema = z.object({
  filter_offer_external_id: z.string().optional().describe("Filter by offer externalId"),
  filter_product_active: z.boolean().optional().describe("Only offers of active products"),
  details: z.boolean().optional().describe("Include per-store breakdown (sets filter[details]=1)"),
  site: siteField,
  page: pageField,
  limit: limitField,
});

export async function handleStoreInventories(params: z.infer<typeof storeInventoriesSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const query: Record<string, string> = { page: String(params.page), limit: String(params.limit) };
    if (params.filter_offer_external_id) query["filter[offerExternalId][]"] = params.filter_offer_external_id;
    if (params.filter_product_active !== undefined) query["filter[productActive]"] = params.filter_product_active ? "1" : "0";
    if (params.details) query["filter[details]"] = "1";
    if (params.site) query["site"] = params.site;
    const result = await retailCrmGet("/store/inventories", query);
    return ok(result);
  });
}
