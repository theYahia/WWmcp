import { z } from "zod";
import { oneCGet, oneCPost, oneCPatch, buildODataPath, buildKeyedPath } from "../client.js";
import { refKeySchema, normaliseEntity } from "../validation.js";

export const getCatalogsSchema = z.object({
  catalog_name: z.string().describe("Имя справочника — с префиксом Catalog_ или без него (Catalog_Номенклатура / Номенклатура)"),
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

  const path = buildODataPath(normaliseEntity("Catalog_", params.catalog_name), query);
  const result = await oneCGet(path);
  return JSON.stringify(result, null, 2);
}

// ──────────────────────────────────────────────────────────────
// create_catalog_item — создать элемент справочника (OData POST)
// ──────────────────────────────────────────────────────────────

export const createCatalogItemSchema = z.object({
  catalog_name: z.string().describe("Имя справочника — с префиксом Catalog_ или без него (Catalog_Номенклатура / Номенклатура)"),
  data: z.record(z.string(), z.unknown()).describe("Поля нового элемента в формате JSON (например, {\"Description\":\"Молоко\"})"),
});

export async function handleCreateCatalogItem(params: z.infer<typeof createCatalogItemSchema>): Promise<string> {
  const path = buildODataPath(normaliseEntity("Catalog_", params.catalog_name), { $format: "json" });
  const result = await oneCPost(path, params.data);
  return JSON.stringify(result, null, 2);
}

// ──────────────────────────────────────────────────────────────
// update_catalog_item — обновить элемент справочника (OData PATCH by Ref_Key)
// ──────────────────────────────────────────────────────────────

export const updateCatalogItemSchema = z.object({
  catalog_name: z.string().describe("Имя справочника — с префиксом Catalog_ или без него"),
  ref_key: refKeySchema.describe("Ref_Key элемента (GUID)"),
  data: z.record(z.string(), z.unknown()).describe("Обновляемые поля"),
});

export async function handleUpdateCatalogItem(params: z.infer<typeof updateCatalogItemSchema>): Promise<string> {
  const path = buildKeyedPath(normaliseEntity("Catalog_", params.catalog_name), params.ref_key, undefined, { $format: "json" });
  const result = await oneCPatch(path, params.data);
  return JSON.stringify(result, null, 2);
}
