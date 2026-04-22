import { z } from "zod";
import { oneCGet, buildODataPath } from "../client.js";

export const getCatalogsSchema = z.object({
  catalog_name: z.string().describe("Имя справочника (например, Catalog_Номенклатура)"),
  filter: z.string().optional().describe("OData $filter (например, Description eq 'Молоко')"),
  select: z.string().optional().describe("OData $select (например, Ref_Key,Description)"),
  top: z.number().int().min(1).max(1000).default(100).describe("Количество записей ($top)"),
  skip: z.number().int().min(0).default(0).describe("Пропустить записей ($skip)"),
  orderby: z.string().optional().describe("OData $orderby (например, Description asc)"),
});

export async function handleGetCatalogs(params: z.infer<typeof getCatalogsSchema>): Promise<string> {
  const query: Record<string, string> = {
    $format: "json",
    $top: String(params.top),
  };
  if (params.skip) query["$skip"] = String(params.skip);
  if (params.filter) query["$filter"] = params.filter;
  if (params.select) query["$select"] = params.select;
  if (params.orderby) query["$orderby"] = params.orderby;

  const path = buildODataPath(params.catalog_name, query);
  const result = await oneCGet(path);
  return JSON.stringify(result, null, 2);
}
