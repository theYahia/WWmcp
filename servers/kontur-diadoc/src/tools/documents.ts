import { z } from "zod";
import { authenticate, diadocGet, diadocPost } from "../client.js";

/** Cap serialized responses so a huge document list can't blow up the model context. */
const MAX_RESPONSE_CHARS = 50_000;

function formatResult(result: unknown): string {
  const json = JSON.stringify(result, null, 2);
  if (json.length <= MAX_RESPONSE_CHARS) return json;
  const dropped = json.length - MAX_RESPONSE_CHARS;
  return `${json.slice(0, MAX_RESPONSE_CHARS)}\n… [truncated ${dropped} chars — narrow the query with filters or pagination (after_index_key)]`;
}

const innSchema = z
  .string()
  .regex(/^(\d{10}|\d{12})$/, "ИНН должен содержать 10 (юрлицо) или 12 (ИП) цифр");
const kppSchema = z.string().regex(/^\d{9}$/, "КПП должен содержать 9 цифр");

/**
 * Convert an ISO date/time string to .NET `DateTime.Ticks` (100-ns units since
 * 0001-01-01 UTC), which is what Diadoc's `timestamp*Ticks` filters expect.
 */
function isoToTicks(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) {
    throw new Error(`Invalid date "${iso}" — use an ISO-8601 value, e.g. "2026-01-31T00:00:00Z".`);
  }
  const EPOCH_TICKS = 621_355_968_000_000_000n; // ticks at 1970-01-01T00:00:00Z
  return (BigInt(ms) * 10_000n + EPOCH_TICKS).toString();
}

// --- authenticate ---

export const authenticateSchema = z.object({});

export async function handleAuthenticate(): Promise<string> {
  const token = await authenticate();
  return formatResult({
    status: "authenticated",
    token_preview: `${token.slice(0, 12)}…`,
  });
}

// --- list_organizations ---

export const listOrganizationsSchema = z.object({
  inn: innSchema.describe("ИНН организации для поиска (обязателен)"),
  kpp: kppSchema.optional().describe("КПП (учитывается только вместе с inn)"),
  include_relations: z
    .boolean()
    .optional()
    .describe("Вернуть признаки отношений контрагента (includeRelations)"),
});

export async function handleListOrganizations(
  params: z.infer<typeof listOrganizationsSchema>,
): Promise<string> {
  const query: Record<string, string> = { inn: params.inn };
  if (params.kpp) query.kpp = params.kpp;
  if (params.include_relations) query.includeRelations = "true";
  return formatResult(await diadocGet("/GetOrganizationsByInnKpp", query));
}

// --- get_organization ---

export const getOrganizationSchema = z.object({
  org_id: z.string().optional().describe("Идентификатор организации (orgId)"),
  box_id: z.string().optional().describe("Идентификатор ящика (boxId, GUID)"),
  inn: innSchema.optional().describe("ИНН организации"),
  kpp: kppSchema.optional().describe("КПП (только вместе с inn)"),
});

export async function handleGetOrganization(
  params: z.infer<typeof getOrganizationSchema>,
): Promise<string> {
  // Diadoc allows exactly one identifier; prefer the most specific available.
  const query: Record<string, string> = {};
  if (params.org_id) {
    query.orgId = params.org_id;
  } else if (params.box_id) {
    query.boxId = params.box_id;
  } else if (params.inn) {
    query.inn = params.inn;
    if (params.kpp) query.kpp = params.kpp;
  } else {
    throw new Error("Укажите один идентификатор: org_id, box_id или inn");
  }
  return formatResult(await diadocGet("/GetOrganization", query));
}

// --- list_documents ---

export const listDocumentsSchema = z.object({
  box_id: z.string().describe("Идентификатор ящика организации (boxId)"),
  filter_category: z
    .string()
    .default("Any.InboundNotFinished")
    .describe("Категория-фильтр (обязательна), напр. 'Any.Inbound', 'Any.InboundNotFinished'"),
  timestamp_from: z
    .string()
    .optional()
    .describe("Нижняя граница времени события, ISO-8601 (конвертируется в тики)"),
  timestamp_to: z.string().optional().describe("Верхняя граница времени события, ISO-8601"),
  from_document_date: z.string().optional().describe("Дата документа от, формат ДД.ММ.ГГГГ"),
  to_document_date: z.string().optional().describe("Дата документа до, формат ДД.ММ.ГГГГ"),
  count: z
    .number()
    .int()
    .min(0)
    .max(100)
    .optional()
    .default(100)
    .describe("Сколько документов вернуть (0–100)"),
  after_index_key: z
    .string()
    .optional()
    .describe("Курсор пагинации из предыдущего ответа (afterIndexKey)"),
  sort_direction: z.enum(["Ascending", "Descending"]).optional().describe("Направление сортировки"),
});

export async function handleListDocuments(
  params: z.infer<typeof listDocumentsSchema>,
): Promise<string> {
  const query: Record<string, string> = {
    boxId: params.box_id,
    filterCategory: params.filter_category,
    count: String(params.count),
  };
  if (params.timestamp_from) query.timestampFromTicks = isoToTicks(params.timestamp_from);
  if (params.timestamp_to) query.timestampToTicks = isoToTicks(params.timestamp_to);
  if (params.from_document_date) query.fromDocumentDate = params.from_document_date;
  if (params.to_document_date) query.toDocumentDate = params.to_document_date;
  if (params.after_index_key) query.afterIndexKey = params.after_index_key;
  if (params.sort_direction) query.sortDirection = params.sort_direction;
  return formatResult(await diadocGet("/V3/GetDocuments", query));
}

// --- get_document ---

export const getDocumentSchema = z.object({
  box_id: z.string().describe("Идентификатор ящика (boxId)"),
  message_id: z.string().describe("Идентификатор сообщения (messageId)"),
  entity_id: z.string().describe("Идентификатор сущности документа (entityId)"),
  inject_entity_content: z
    .boolean()
    .optional()
    .describe("Включать содержимое документа в ответ (injectEntityContent, по умолчанию true)"),
});

export async function handleGetDocument(
  params: z.infer<typeof getDocumentSchema>,
): Promise<string> {
  const query: Record<string, string> = {
    boxId: params.box_id,
    messageId: params.message_id,
    entityId: params.entity_id,
  };
  if (params.inject_entity_content !== undefined) {
    query.injectEntityContent = String(params.inject_entity_content);
  }
  return formatResult(await diadocGet("/V3/GetDocument", query));
}

// --- send_document ---

export const sendDocumentSchema = z.object({
  from_box_id: z.string().describe("Идентификатор ящика-отправителя (FromBoxId)"),
  to_box_id: z.string().describe("Идентификатор ящика-получателя (ToBoxId)"),
  type_named_id: z
    .string()
    .describe(
      "Тип документа Diadoc (TypeNamedId), напр. 'Nonformalized', 'UniversalTransferDocument'",
    ),
  content_base64: z.string().describe("Содержимое документа в base64"),
  signature_base64: z
    .string()
    .optional()
    .describe(
      "Открепленная подпись (base64). Опустите для неподписанных/неформализованных документов. " +
        "Diadoc сам подпись НЕ создаёт — её формирует клиент (КриптоПро/CAdES).",
    ),
  file_name: z.string().optional().describe("Имя файла (сохраняется в метаданных)"),
  need_recipient_signature: z
    .boolean()
    .optional()
    .describe("Требуется ответная подпись получателя (NeedRecipientSignature)"),
});

export async function handleSendDocument(
  params: z.infer<typeof sendDocumentSchema>,
): Promise<string> {
  const signedContent: Record<string, unknown> = { Content: params.content_base64 };
  if (params.signature_base64) signedContent.Signature = params.signature_base64;

  const attachment: Record<string, unknown> = {
    TypeNamedId: params.type_named_id,
    SignedContent: signedContent,
  };
  if (params.need_recipient_signature !== undefined) {
    attachment.NeedRecipientSignature = params.need_recipient_signature;
  }
  if (params.file_name) {
    attachment.Metadata = [{ Key: "FileName", Value: params.file_name }];
  }

  const body = {
    FromBoxId: params.from_box_id,
    ToBoxId: params.to_box_id,
    DocumentAttachments: [attachment],
  };
  return formatResult(await diadocPost("/V3/PostMessage", body));
}

// --- sign_document ---

export const signDocumentSchema = z.object({
  box_id: z.string().describe("Идентификатор ящика (boxId)"),
  message_id: z.string().describe("Идентификатор сообщения (messageId)"),
  entity_id: z.string().describe("Идентификатор подписываемой сущности (ParentEntityId)"),
  signature_base64: z
    .string()
    .optional()
    .describe("Подпись документа (base64). Боевую подпись формирует клиент (КриптоПро/CAdES)."),
  sign_with_test_signature: z
    .boolean()
    .optional()
    .describe("Подписать тестовой подписью Diadoc (только в песочнице)"),
});

export async function handleSignDocument(
  params: z.infer<typeof signDocumentSchema>,
): Promise<string> {
  if (!params.signature_base64 && !params.sign_with_test_signature) {
    throw new Error(
      "Укажите signature_base64 (боевая подпись) или sign_with_test_signature=true (только песочница)",
    );
  }
  const signature: Record<string, unknown> = { ParentEntityId: params.entity_id };
  if (params.signature_base64) signature.Signature = params.signature_base64;
  if (params.sign_with_test_signature) signature.SignWithTestSignature = true;

  const body = { Signatures: [signature] };
  // boxId / messageId identify the target message and go in the query string.
  return formatResult(
    await diadocPost("/V3/PostMessagePatch", body, {
      boxId: params.box_id,
      messageId: params.message_id,
    }),
  );
}

// --- list_counterparties ---

export const listCounterpartiesSchema = z.object({
  box_id: z.string().describe("Мой идентификатор ящика (myBoxId)"),
  counteragent_status: z
    .enum(["IsMyCounteragent", "InvitesMe", "IsInvitedByMe", "Rejected"])
    .optional()
    .describe("Фильтр по статусу контрагента"),
  query: z
    .string()
    .optional()
    .describe("Текстовый поиск по названию или ИНН (нельзя вместе с after_index_key)"),
  page_size: z.number().int().min(1).max(100).optional().describe("Размер страницы (1–100)"),
  after_index_key: z.string().optional().describe("Курсор пагинации (afterIndexKey)"),
});

export async function handleListCounterparties(
  params: z.infer<typeof listCounterpartiesSchema>,
): Promise<string> {
  const query: Record<string, string> = { myBoxId: params.box_id };
  if (params.counteragent_status) query.counteragentStatus = params.counteragent_status;
  if (params.query) query.query = params.query;
  if (params.page_size !== undefined) query.pageSize = String(params.page_size);
  if (params.after_index_key) query.afterIndexKey = params.after_index_key;
  return formatResult(await diadocGet("/GetCounteragents", query));
}
