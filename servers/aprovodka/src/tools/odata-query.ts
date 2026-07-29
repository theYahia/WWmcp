import { z } from "zod";
import { oneCGet, buildODataPath } from "../client.js";

export const odataQuerySchema = z.object({
  entity: z.string().describe("OData-сущность (например, Catalog_Номенклатура, Document_СчётНаОплатуПокупателю)"),
  filter: z.string().optional().describe("$filter"),
  select: z.string().optional().describe("$select"),
  expand: z.string().optional().describe("$expand для связанных таблиц"),
  top: z.number().int().min(1).max(5000).default(100).describe("$top"),
  skip: z.number().int().min(0).default(0).describe("$skip"),
  orderby: z.string().optional().describe("$orderby"),
  inlinecount: z.boolean().default(false).describe("Добавить $inlinecount=allpages"),
});

export async function handleODataQuery(params: z.infer<typeof odataQuerySchema>): Promise<string> {
  const query: Record<string, string> = {
    $format: "json",
    $top: String(params.top),
  };
  if (params.skip) query["$skip"] = String(params.skip);
  if (params.filter) query["$filter"] = params.filter;
  if (params.select) query["$select"] = params.select;
  if (params.expand) query["$expand"] = params.expand;
  if (params.orderby) query["$orderby"] = params.orderby;
  if (params.inlinecount) query["$inlinecount"] = "allpages";

  const path = buildODataPath(params.entity, query);
  const result = await oneCGet(path);
  return JSON.stringify(result, null, 2);
}
