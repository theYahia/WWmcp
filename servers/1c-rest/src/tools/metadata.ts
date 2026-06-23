import { z } from "zod";
import { oneCGet, buildODataPath, escapeODataString } from "../client.js";
import { odataDate } from "../validation.js";

// ──────────────────────────────────────────────────────────────
// list_entities — discovery: список всех сущностей базы 1С
// ──────────────────────────────────────────────────────────────

export const listEntitiesSchema = z.object({
  type: z
    .enum(["all", "catalogs", "documents", "registers", "reports"])
    .default("all")
    .describe(
      "Фильтр по типу: all — все сущности, catalogs — справочники (Catalog_*), " +
      "documents — документы (Document_*), registers — регистры (AccumulationRegister_*, InformationRegister_*), " +
      "reports — отчёты (Report_*)",
    ),
  search: z
    .string()
    .optional()
    .describe("Подстрока для поиска в имени сущности (например, 'Номенклатура')"),
});

export async function handleListEntities(
  params: z.infer<typeof listEntitiesSchema>,
): Promise<string> {
  // GET /odata/standard.odata/ возвращает JSON-массив всех EntitySet
  const raw = await oneCGet("/odata/standard.odata/?$format=json") as {
    value?: Array<{ name: string; url: string }>;
  };

  let entities = raw.value ?? [];

  // Фильтрация по типу
  if (params.type !== "all") {
    const prefixMap: Record<string, string[]> = {
      catalogs:  ["Catalog_"],
      documents: ["Document_"],
      registers: ["AccumulationRegister_", "InformationRegister_"],
      reports:   ["Report_"],
    };
    const prefixes = prefixMap[params.type] ?? [];
    entities = entities.filter((e) =>
      prefixes.some((p) => e.name.startsWith(p)),
    );
  }

  // Поиск по подстроке
  if (params.search) {
    const q = params.search.toLowerCase();
    entities = entities.filter((e) => e.name.toLowerCase().includes(q));
  }

  return JSON.stringify(
    {
      total: entities.length,
      entities: entities.map((e) => e.name),
    },
    null,
    2,
  );
}

// ──────────────────────────────────────────────────────────────
// get_document_by_number — удобный поиск документа по номеру
// ──────────────────────────────────────────────────────────────

export const getDocumentByNumberSchema = z.object({
  document_type: z
    .string()
    .describe("Тип документа (например, Document_РеализацияТоваровУслуг)"),
  number: z.string().describe("Номер документа"),
  date: odataDate
    .optional()
    .describe("Дата создания документа в формате YYYY-MM-DD (необязательно, сужает поиск)"),
  select: z
    .string()
    .optional()
    .describe("Поля для выборки через OData $select (например, Ref_Key,Number,Date)"),
});

export async function handleGetDocumentByNumber(
  params: z.infer<typeof getDocumentByNumberSchema>,
): Promise<string> {
  let filter = `Number eq '${escapeODataString(params.number)}'`;
  if (params.date) {
    filter += ` and Date ge datetime'${params.date}T00:00:00'`;
    filter += ` and Date lt datetime'${params.date}T23:59:59'`;
  }

  const query: Record<string, string> = {
    $format: "json",
    $filter: filter,
    $top: "10",
  };
  if (params.select) query["$select"] = params.select;

  const path = buildODataPath(params.document_type, query);
  const result = await oneCGet(path);
  return JSON.stringify(result, null, 2);
}

// ──────────────────────────────────────────────────────────────
// get_metadata — сырой EDMX ($metadata) всей базы 1С
// ──────────────────────────────────────────────────────────────

export const getMetadataSchema = z.object({});

export async function handleGetMetadata(
  _params: z.infer<typeof getMetadataSchema>,
): Promise<string> {
  // $metadata возвращает XML (EDMX) — oneCGet вернёт его строкой (JSON.parse упадёт → текст).
  const result = await oneCGet("/odata/standard.odata/$metadata");
  return typeof result === "string" ? result : JSON.stringify(result, null, 2);
}

// ──────────────────────────────────────────────────────────────
// describe_entity — список полей сущности по образцу записи
// (прагматично: $top=1 вместо парсинга EDMX)
// ──────────────────────────────────────────────────────────────

export const describeEntitySchema = z.object({
  entity: z
    .string()
    .describe("Имя сущности (например, Catalog_Номенклатура, Document_РеализацияТоваровУслуг)"),
});

export async function handleDescribeEntity(
  params: z.infer<typeof describeEntitySchema>,
): Promise<string> {
  const path = buildODataPath(params.entity, { $format: "json", $top: "1" });
  const raw = (await oneCGet(path)) as { value?: Array<Record<string, unknown>> };
  const sample = raw.value?.[0];
  if (!sample) {
    return JSON.stringify(
      { entity: params.entity, fields: [], note: "Сущность пуста — полей по образцу не извлечь. Используйте get_metadata для EDMX." },
      null,
      2,
    );
  }
  const fields = Object.keys(sample).map((name) => ({
    name,
    type: sample[name] === null ? "null" : typeof sample[name],
  }));
  return JSON.stringify({ entity: params.entity, field_count: fields.length, fields }, null, 2);
}
