import { z } from "zod";
import {
  oneCGet, oneCPost, oneCPatch, oneCDelete,
  buildODataPath, buildKeyedPath,
} from "../client.js";
import { refKeySchema, normaliseEntity } from "../validation.js";
import { isSafetyEnvelope } from "../lib/write-safety.js";

export const getDocumentsSchema = z.object({
  document_type: z.string().describe("Тип документа — с префиксом Document_ или без него (Document_РеализацияТоваровУслуг / РеализацияТоваровУслуг)"),
  filter: z.string().optional().describe("OData $filter (например, Date ge datetime'2024-01-01T00:00:00')"),
  select: z.string().optional().describe("OData $select"),
  top: z.number().int().min(1).max(1000).default(100).describe("Количество записей ($top)"),
  skip: z.number().int().min(0).default(0).describe("Пропустить записей ($skip)"),
  orderby: z.string().optional().describe("OData $orderby"),
});

export async function handleGetDocuments(params: z.infer<typeof getDocumentsSchema>): Promise<string> {
  const query: Record<string, string> = {
    $format: "json",
    $top: String(params.top),
  };
  if (params.skip) query["$skip"] = String(params.skip);
  if (params.filter) query["$filter"] = params.filter;
  if (params.select) query["$select"] = params.select;
  if (params.orderby) query["$orderby"] = params.orderby;

  const path = buildODataPath(normaliseEntity("Document_", params.document_type), query);
  const result = await oneCGet(path);
  return JSON.stringify(result, null, 2);
}

export const createDocumentSchema = z.object({
  document_type: z.string().describe("Тип документа — с префиксом Document_ или без него (Document_РеализацияТоваровУслуг / РеализацияТоваровУслуг)"),
  data: z.record(z.string(), z.unknown()).describe("Данные документа в формате JSON"),
});

export async function handleCreateDocument(params: z.infer<typeof createDocumentSchema>): Promise<string> {
  const path = buildODataPath(normaliseEntity("Document_", params.document_type), { $format: "json" });
  const result = await oneCPost(path, params.data);
  return JSON.stringify(result, null, 2);
}

export const updateDocumentSchema = z.object({
  document_type: z.string().describe("Тип документа — с префиксом Document_ или без него"),
  ref_key: refKeySchema.describe("Ref_Key документа (GUID)"),
  data: z.record(z.string(), z.unknown()).describe("Обновляемые поля"),
});

export async function handleUpdateDocument(params: z.infer<typeof updateDocumentSchema>): Promise<string> {
  const path = buildKeyedPath(normaliseEntity("Document_", params.document_type), params.ref_key, undefined, { $format: "json" });
  const result = await oneCPatch(path, params.data);
  return JSON.stringify(result, null, 2);
}

// ──────────────────────────────────────────────────────────────
// post_document — провести документ (1C OData bound action Post)
// ──────────────────────────────────────────────────────────────

export const postDocumentSchema = z.object({
  document_type: z.string().describe("Тип документа — с префиксом Document_ или без него (Document_РеализацияТоваровУслуг / РеализацияТоваровУслуг)"),
  ref_key: refKeySchema.describe("Ref_Key документа (GUID)"),
  operational: z
    .boolean()
    .default(false)
    .describe("Оперативное проведение (PostingModeOperational). По умолчанию false — неоперативное."),
});

export async function handlePostDocument(params: z.infer<typeof postDocumentSchema>): Promise<string> {
  const path = buildKeyedPath(normaliseEntity("Document_", params.document_type), params.ref_key, "Post", {
    $format: "json",
    PostingModeOperational: String(params.operational),
  });
  const result = await oneCPost(path, {});
  return JSON.stringify(result, null, 2);
}

// ──────────────────────────────────────────────────────────────
// unpost_document — отменить проведение (bound action Unpost)
// ──────────────────────────────────────────────────────────────

export const unpostDocumentSchema = z.object({
  document_type: z.string().describe("Тип документа — с префиксом Document_ или без него"),
  ref_key: refKeySchema.describe("Ref_Key документа (GUID)"),
});

export async function handleUnpostDocument(params: z.infer<typeof unpostDocumentSchema>): Promise<string> {
  const path = buildKeyedPath(normaliseEntity("Document_", params.document_type), params.ref_key, "Unpost", { $format: "json" });
  const result = await oneCPost(path, {});
  return JSON.stringify(result, null, 2);
}

// ──────────────────────────────────────────────────────────────
// delete_document — физическое удаление документа (OData DELETE)
// ──────────────────────────────────────────────────────────────

export const deleteDocumentSchema = z.object({
  document_type: z.string().describe("Тип документа — с префиксом Document_ или без него"),
  ref_key: refKeySchema.describe("Ref_Key документа (GUID)"),
});

export async function handleDeleteDocument(params: z.infer<typeof deleteDocumentSchema>): Promise<string> {
  const path = buildKeyedPath(normaliseEntity("Document_", params.document_type), params.ref_key);
  const res = await oneCDelete(path);
  // With write-safety active the call returns a preview / executed envelope that
  // already reports the outcome (and that the delete is irreversible) — passing
  // it through beats claiming `deleted: true` after a dry-run.
  if (isSafetyEnvelope(res)) return JSON.stringify(res, null, 2);
  return JSON.stringify(
    { deleted: true, document_type: params.document_type, ref_key: params.ref_key },
    null,
    2,
  );
}

// ──────────────────────────────────────────────────────────────
// get_document_lines — табличная часть документа через OData $expand
// ──────────────────────────────────────────────────────────────

export const getDocumentLinesSchema = z.object({
  document_type: z.string().describe("Тип документа — с префиксом Document_ или без него (Document_РеализацияТоваровУслуг / РеализацияТоваровУслуг)"),
  ref_key: refKeySchema.describe("Ref_Key документа (GUID)"),
  tabular_section: z
    .string()
    .describe(
      "Имя табличной части (например, Товары, Услуги). Имя конфиг-зависимо — " +
      "проверьте через get_metadata / describe_entity, если не уверены.",
    ),
});

export async function handleGetDocumentLines(
  params: z.infer<typeof getDocumentLinesSchema>,
): Promise<string> {
  // 1C OData 3.0: табличные части — это collection navigation properties.
  // $expand подтягивает строки; $select сужает документ до этой части.
  const path = buildKeyedPath(normaliseEntity("Document_", params.document_type), params.ref_key, undefined, {
    $format: "json",
    $expand: params.tabular_section,
    $select: params.tabular_section,
  });
  const result = await oneCGet(path);
  return JSON.stringify(result, null, 2);
}
