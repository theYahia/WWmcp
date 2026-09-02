import { z } from "zod";
import { oneCGet, oneCPost, buildODataPath, buildVirtualTablePath, escapeODataString } from "../client.js";
import { odataDateTime, normaliseEntity, normaliseRegisterEntity } from "../validation.js";
import { probeTop, toPage } from "../lib/paging.js";

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
  const query: Record<string, string> = {
    $format: "json",
    $top: probeTop(params.top),
  };
  if (params.skip) query["$skip"] = String(params.skip);
  if (params.filter) query["$filter"] = params.filter;
  if (params.select) query["$select"] = params.select;
  if (params.orderby) query["$orderby"] = params.orderby;

  const path = buildODataPath(entity, query);
  const result = await oneCGet(path);
  return JSON.stringify(toPage(result, params.top, params.skip), null, 2);
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
  return JSON.stringify(result, null, 2);
}

// ──────────────────────────────────────────────────────────────
// get_accumulation_balance — остатки регистра накопления через
// виртуальный метод 1C OData /Balance(Period=…,Condition=…)
// ──────────────────────────────────────────────────────────────

export const getAccumulationBalanceSchema = z.object({
  register_name: z.string().describe("Имя регистра накопления — с префиксом AccumulationRegister_ или без него"),
  period: odataDateTime
    .optional()
    .describe("Дата среза остатков YYYY-MM-DDTHH:MM:SS (Period). Без указания — текущие остатки."),
  condition: z
    .string()
    .optional()
    .describe("OData-условие отбора измерений (Condition), например \"Склад_Key eq guid'…'\""),
});

export async function handleGetAccumulationBalance(
  params: z.infer<typeof getAccumulationBalanceSchema>,
): Promise<string> {
  // Виртуальный ресурс: AccumulationRegister_<name>/Balance(Period=…,Condition=…)
  const args: Record<string, string> = {};
  if (params.period) args["Period"] = `datetime'${params.period}'`;
  if (params.condition) args["Condition"] = `'${escapeODataString(params.condition)}'`;
  const path = buildVirtualTablePath(
    normaliseEntity("AccumulationRegister_", params.register_name),
    "Balance",
    args,
    { $format: "json" },
  );
  const result = await oneCGet(path);
  return JSON.stringify(result, null, 2);
}
