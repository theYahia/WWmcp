import { z } from "zod";
import { oneCGet, buildODataPath } from "../client.js";

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
  date: z
    .string()
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
  let filter = `Number eq '${params.number}'`;
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
