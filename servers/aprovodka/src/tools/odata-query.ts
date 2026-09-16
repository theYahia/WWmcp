import { z } from "zod";
import { oneCGet, buildODataPath } from "../client.js";
import { buildQuery, pageJson } from "../lib/paging.js";

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
  const query = buildQuery(params);
  const path = buildODataPath(params.entity, query);
  const result = await oneCGet(path);
  return pageJson(result, params.top, params.skip);
}
