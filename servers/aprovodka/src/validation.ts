/**
 * Shared zod field schemas for OData input validation.
 *
 * Centralised here so every tool that takes a Ref_Key or a date validates it
 * identically, and the LLM gets one consistent, actionable error message.
 * The security-critical guard for keyed paths lives in `buildKeyedPath`
 * (client.ts); these schemas validate at the MCP input boundary on top of it.
 */
import { z } from "zod";
import { GUID_RE } from "./client.js";
import { ENTITY_PREFIXES } from "./lib/entity-prefixes.js";

/** A 1C Ref_Key (GUID). */
export const refKeySchema = z
  .string()
  .regex(
    GUID_RE,
    "ref_key must be a 1C Ref_Key GUID, e.g. 01234567-89ab-cdef-0123-456789abcdef",
  );

/** OData date-only literal: YYYY-MM-DD. */
export const odataDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format");

/** OData datetime literal: YYYY-MM-DDTHH:MM:SS. */
export const odataDateTime = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
    "must be in YYYY-MM-DDTHH:MM:SS format",
  );

/** Известные префиксы имён entity set в OData 1С — из единого источника. */
export { ENTITY_PREFIXES } from "./lib/entity-prefixes.js";

/**
 * Достроить префикс имени сущности, если вызывающий его не указал.
 *
 * Инструменты исторически разошлись в трёх конвенциях: `get_catalogs` требует
 * полное `Catalog_Номенклатура`, `get_register` — голое `ЦеныНоменклатуры`, а
 * `get_constant` принимал обе формы. Здесь обобщена третья: обе формы работают
 * везде, где префикс однозначен.
 *
 * Проверка намеренно только `startsWith`, без эвристик по подчёркиванию: имена
 * вида `Document_ЗаказНаПроизводство2_2` и табличные части
 * `Catalog_Организации_КонтактнаяИнформация` — настоящие, и любое правило «есть
 * подчёркивание → префикс уже на месте» их ломает.
 *
 * Не информационно-полное преобразование: объект 1С, названный, например,
 * `AccumulationRegister_Old`, даст entity set
 * `AccumulationRegister_AccumulationRegister_Old`, и здесь он схлопнется.
 * Аварийный выход для таких случаев — инструменты, которые имя не трогают:
 * `odata_query`, `batch_query`, `get_by_key`, `count_entities`, `describe_entity`.
 */
export function normaliseEntity(prefix: string, name: string): string {
  return name.startsWith(prefix) ? name : prefix + name;
}

/**
 * То же для регистров, где вид задаётся отдельным аргументом-перечислением.
 *
 * Два источника истины могут противоречить друг другу (`register_type` говорит
 * одно, префикс в имени — другое). Молча склеивать нельзя: получилось бы
 * `AccumulationRegister_InformationRegister_Цены`, то есть 404 с непонятной
 * причиной. Поэтому противоречие — ошибка с явным текстом.
 */
export function normaliseRegisterEntity(kind: string, name: string): string {
  const prefix = `${kind}_`;
  if (name.startsWith(prefix)) return name;

  const foreign = ENTITY_PREFIXES.find(
    (p) => p.endsWith("Register_") && name.startsWith(p),
  );
  if (foreign) {
    throw new Error(
      `register_name "${name}" starts with ${foreign} but register_type is ${kind}. ` +
      `Pass the bare name (e.g. "ЦеныНоменклатуры") or make the two agree.`,
    );
  }
  return prefix + name;
}
