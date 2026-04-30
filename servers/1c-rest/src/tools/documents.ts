import { z } from "zod";
import { oneCGet, oneCPost, oneCPatch, buildODataPath } from "../client.js";

export const getDocumentsSchema = z.object({
  document_type: z.string().describe("Тип документа (например, Document_РеализацияТоваровУслуг)"),
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

  const path = buildODataPath(params.document_type, query);
  const result = await oneCGet(path);
  return JSON.stringify(result, null, 2);
}

export const createDocumentSchema = z.object({
  document_type: z.string().describe("Тип документа (например, Document_РеализацияТоваровУслуг)"),
  data: z.record(z.unknown()).describe("Данные документа в формате JSON"),
});

export async function handleCreateDocument(params: z.infer<typeof createDocumentSchema>): Promise<string> {
  const path = buildODataPath(params.document_type, { $format: "json" });
  const result = await oneCPost(path, params.data);
  return JSON.stringify(result, null, 2);
}

export const updateDocumentSchema = z.object({
  document_type: z.string().describe("Тип документа"),
  ref_key: z.string().describe("Ref_Key документа (GUID)"),
  data: z.record(z.unknown()).describe("Обновляемые поля"),
});

export async function handleUpdateDocument(params: z.infer<typeof updateDocumentSchema>): Promise<string> {
  const path = buildODataPath(
    `${params.document_type}(guid'${params.ref_key}')`,
    { $format: "json" },
  );
  const result = await oneCPatch(path, params.data);
  return JSON.stringify(result, null, 2);
}
