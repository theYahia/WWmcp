import { z } from "zod";
import { oneCGet, oneCPatch, buildODataPath, buildKeyedPath, escapeODataString } from "../client.js";
import { refKeySchema } from "../validation.js";

// ──────────────────────────────────────────────────────────────
// find_by_description — нечёткий поиск элементов по Description
// (OData v3 substringof — поддерживается 1C OData 3.0)
// ──────────────────────────────────────────────────────────────

export const findByDescriptionSchema = z.object({
  entity: z.string().describe("Сущность для поиска (например, Catalog_Контрагенты)"),
  query: z.string().describe("Подстрока для поиска в поле Description"),
  top: z.number().int().min(1).max(100).default(20).describe("Сколько записей вернуть"),
});

export async function handleFindByDescription(
  params: z.infer<typeof findByDescriptionSchema>,
): Promise<string> {
  const safe = escapeODataString(params.query);
  const path = buildODataPath(params.entity, {
    $format: "json",
    $filter: `substringof('${safe}',Description)`,
    $top: String(params.top),
  });
  const result = await oneCGet(path);
  return JSON.stringify(result, null, 2);
}

// ──────────────────────────────────────────────────────────────
// get_by_key — получить одну запись по Ref_Key (GUID)
// ──────────────────────────────────────────────────────────────

export const getByKeySchema = z.object({
  entity: z.string().describe("Сущность (например, Catalog_Номенклатура)"),
  ref_key: refKeySchema.describe("Ref_Key (GUID)"),
  select: z.string().optional().describe("OData $select"),
});

export async function handleGetByKey(params: z.infer<typeof getByKeySchema>): Promise<string> {
  const query: Record<string, string> = { $format: "json" };
  if (params.select) query["$select"] = params.select;
  const path = buildKeyedPath(params.entity, params.ref_key, undefined, query);
  const result = await oneCGet(path);
  return JSON.stringify(result, null, 2);
}

// ──────────────────────────────────────────────────────────────
// count_entities — количество записей ($inlinecount, $top=0)
// ──────────────────────────────────────────────────────────────

export const countEntitiesSchema = z.object({
  entity: z.string().describe("Сущность для подсчёта (например, Document_РеализацияТоваровУслуг)"),
  filter: z.string().optional().describe("OData $filter для условия подсчёта"),
});

export async function handleCountEntities(
  params: z.infer<typeof countEntitiesSchema>,
): Promise<string> {
  const query: Record<string, string> = {
    $format: "json",
    $top: "0",
    $inlinecount: "allpages",
  };
  if (params.filter) query["$filter"] = params.filter;
  const path = buildODataPath(params.entity, query);
  const raw = (await oneCGet(path)) as Record<string, unknown>;
  const count = raw["odata.count"] ?? raw["@odata.count"] ?? null;
  return JSON.stringify({ entity: params.entity, count }, null, 2);
}

// ──────────────────────────────────────────────────────────────
// set_deletion_mark — пометить/снять пометку удаления (PATCH DeletionMark)
// предпочтительнее физического delete_document
// ──────────────────────────────────────────────────────────────

export const setDeletionMarkSchema = z.object({
  entity: z.string().describe("Сущность (Catalog_* или Document_*)"),
  ref_key: refKeySchema.describe("Ref_Key (GUID)"),
  mark: z.boolean().default(true).describe("true — пометить на удаление, false — снять пометку"),
});

export async function handleSetDeletionMark(
  params: z.infer<typeof setDeletionMarkSchema>,
): Promise<string> {
  const path = buildKeyedPath(params.entity, params.ref_key, undefined, { $format: "json" });
  const result = await oneCPatch(path, { DeletionMark: params.mark });
  return JSON.stringify(result, null, 2);
}

// ──────────────────────────────────────────────────────────────
// get_recent_documents — последние документы по дате (Date desc)
// ──────────────────────────────────────────────────────────────

export const getRecentDocumentsSchema = z.object({
  document_type: z.string().describe("Тип документа (например, Document_РеализацияТоваровУслуг)"),
  top: z.number().int().min(1).max(100).default(10).describe("Сколько последних документов"),
  posted_only: z.boolean().default(false).describe("Только проведённые (Posted eq true)"),
});

export async function handleGetRecentDocuments(
  params: z.infer<typeof getRecentDocumentsSchema>,
): Promise<string> {
  const query: Record<string, string> = {
    $format: "json",
    $orderby: "Date desc",
    $top: String(params.top),
  };
  if (params.posted_only) query["$filter"] = "Posted eq true";
  const path = buildODataPath(params.document_type, query);
  const result = await oneCGet(path);
  return JSON.stringify(result, null, 2);
}
