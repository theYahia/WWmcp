import { z } from "zod";
import { oneCGet, oneCPost, buildODataPath, buildVirtualTablePath, escapeODataString } from "../client.js";
import { odataDateTime, normaliseEntity, normaliseRegisterEntity } from "../validation.js";
import { buildQuery, pageJson } from "../lib/paging.js";
import { periodArgs, requireStableOrder } from "../lib/virtual-tables.js";

export const getRegisterSchema = z.object({
  register_type: z.enum(["InformationRegister", "AccumulationRegister"]).describe("Тип регистра"),
  register_name: z.string().describe("Имя регистра — обычно без префикса (ЦеныНоменклатуры); полное имя тоже принимается, но должно совпадать с register_type"),
  filter: z.string().optional().describe("OData $filter"),
  select: z.string().optional().describe("OData $select"),
  top: z.number().int().min(1).max(5000).default(100).describe("$top"),
  skip: z.number().int().min(0).default(0).describe("$skip"),
  orderby: z.string().optional().describe("OData $orderby"),
});

export async function handleGetRegister(params: z.infer<typeof getRegisterSchema>): Promise<string> {
  const entity = normaliseRegisterEntity(params.register_type, params.register_name);
  const query = buildQuery(params);
  const path = buildODataPath(entity, query);
  const result = await oneCGet(path);
  return pageJson(result, params.top, params.skip);
}

// ──────────────────────────────────────────────────────────────
// write_information_register — записать запись в независимый
// регистр сведений (OData POST на InformationRegister_*)
// ──────────────────────────────────────────────────────────────

export const writeInformationRegisterSchema = z.object({
  register_name: z.string().describe("Имя регистра сведений — с префиксом InformationRegister_ или без него"),
  data: z.record(z.string(), z.unknown()).describe("Запись регистра: измерения + ресурсы (например, {\"Period\":\"2024-01-01T00:00:00\",\"Номенклатура_Key\":\"...\",\"Цена\":100})"),
});

export async function handleWriteInformationRegister(
  params: z.infer<typeof writeInformationRegisterSchema>,
): Promise<string> {
  const path = buildODataPath(normaliseEntity("InformationRegister_", params.register_name), { $format: "json" });
  const result = await oneCPost(path, params.data);
  return JSON.stringify(result);
}

// ──────────────────────────────────────────────────────────────
// get_accumulation_balance — виртуальные таблицы регистра накопления:
// остатки (Balance), обороты (Turnovers) и остатки с оборотами
// (BalanceAndTurnovers). Раньше был только Balance, и обороты регистров
// вроде ВыручкаИСебестоимостьПродаж были недоступны вовсе: get_register
// читает основную таблицу, а у таких регистров по Period её не отобрать.
// ──────────────────────────────────────────────────────────────

export const ACCUMULATION_VIRTUAL_TABLES = ["Balance", "Turnovers", "BalanceAndTurnovers"] as const;

export const getAccumulationBalanceSchema = z.object({
  register_name: z.string().describe("Имя регистра накопления — с префиксом AccumulationRegister_ или без него"),
  table: z
    .enum(ACCUMULATION_VIRTUAL_TABLES)
    .default("Balance")
    .describe(
      "Виртуальная таблица. Balance — остатки на дату (period). Turnovers — обороты за период " +
      "(start_period + end_period). BalanceAndTurnovers — остатки и обороты за период. " +
      "У регистров оборотов (например, ВыручкаИСебестоимостьПродаж) есть только Turnovers: " +
      "Balance / BalanceAndTurnovers там отвечают «Метод не найден».",
    ),
  period: odataDateTime
    .optional()
    .describe("Только для Balance: дата среза остатков YYYY-MM-DDTHH:MM:SS. Без указания — текущие остатки."),
  start_period: odataDateTime
    .optional()
    .describe("Начало периода для Turnovers / BalanceAndTurnovers."),
  end_period: odataDateTime
    .optional()
    .describe("Конец периода для Turnovers / BalanceAndTurnovers."),
  condition: z
    .string()
    .optional()
    .describe("OData-условие отбора измерений (Condition), например \"Склад_Key eq guid'…'\""),
  dimensions: z
    .string()
    .optional()
    .describe(
      "Измерения, до которых свернуть итоги (Dimensions), через запятую без _Key: " +
      "\"Подразделение,СтатьяРасходов\". Остальные измерения в ответ не попадут — " +
      "строк меньше, ответ короче.",
    ),
  select: z
    .string()
    .optional()
    .describe("OData $select, например \"Подразделение_Key,СуммаВыручкиTurnover,СтоимостьTurnover\""),
  filter: z.string().optional().describe("OData $filter по полям таблицы"),
  orderby: z
    .string()
    .optional()
    .describe("OData $orderby. Обязателен вместе с top/skip — без порядка страницы нестабильны."),
  top: z
    .number()
    .int()
    .min(1)
    .max(5000)
    .optional()
    .describe("$top — только вместе с orderby. Без top возвращаются все строки (с обрезкой по бюджету ответа)."),
  skip: z.number().int().min(0).optional().describe("$skip — только вместе с orderby"),
});

export async function handleGetAccumulationBalance(
  params: z.infer<typeof getAccumulationBalanceSchema>,
): Promise<string> {
  // AccumulationRegister_<name>/<Table>(Period=…|StartPeriod=…,EndPeriod=…,Condition=…,Dimensions=…)
  // Старые вызовы без table — это Balance, как и до появления параметра.
  const table = params.table ?? "Balance";
  const args = periodArgs(table, params);
  requireStableOrder(params);
  if (params.condition) args["Condition"] = `'${escapeODataString(params.condition)}'`;
  if (params.dimensions) args["Dimensions"] = `'${escapeODataString(params.dimensions)}'`;
  const path = buildVirtualTablePath(
    normaliseEntity("AccumulationRegister_", params.register_name),
    table,
    args,
    buildQuery(params),
  );
  const result = await oneCGet(path);
  // Без top — Infinity: конверт тот же, has_more=true только если ответ обрезан.
  return pageJson(result, params.top ?? Number.POSITIVE_INFINITY, params.skip ?? 0);
}
