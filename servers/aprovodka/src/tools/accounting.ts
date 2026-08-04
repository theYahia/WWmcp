import { z } from "zod";
import { oneCGet, buildODataPath, buildVirtualTablePath, escapeODataString } from "../client.js";
import { normaliseEntity, odataDateTime } from "../validation.js";

// ──────────────────────────────────────────────────────────────
// get_accounting_register — записи регистра бухгалтерии
// (AccountingRegister_*, например Хозрасчетный — проводки)
// ──────────────────────────────────────────────────────────────

export const getAccountingRegisterSchema = z.object({
  register_name: z
    .string()
    .default("Хозрасчетный")
    .describe("Имя регистра бухгалтерии (по умолчанию Хозрасчетный — основной план счетов)"),
  filter: z
    .string()
    .optional()
    .describe("OData $filter (например, Period ge datetime'2024-01-01T00:00:00')"),
  select: z.string().optional().describe("OData $select"),
  top: z.number().int().min(1).max(5000).default(100).describe("$top"),
  skip: z.number().int().min(0).default(0).describe("$skip"),
  orderby: z.string().optional().describe("OData $orderby (например, Period desc)"),
});

export async function handleGetAccountingRegister(
  params: z.infer<typeof getAccountingRegisterSchema>,
): Promise<string> {
  const query: Record<string, string> = {
    $format: "json",
    $top: String(params.top),
  };
  if (params.skip) query["$skip"] = String(params.skip);
  if (params.filter) query["$filter"] = params.filter;
  if (params.select) query["$select"] = params.select;
  if (params.orderby) query["$orderby"] = params.orderby;

  const path = buildODataPath(normaliseEntity("AccountingRegister_", params.register_name), query);
  const result = await oneCGet(path);
  return JSON.stringify(result, null, 2);
}

// ──────────────────────────────────────────────────────────────
// get_accounting_balance — виртуальные таблицы регистра бухгалтерии
// (остатки, обороты, субконто). Раньше не покрывались ни одним
// инструментом: buildODataPath кодирует '/' и скобки вызова.
// ──────────────────────────────────────────────────────────────

/**
 * Таблицы, чьи ИМЕНА подтверждены источниками из `presets/common.ts`.
 *
 * Обороты по дебету/кредиту сюда НЕ включены сознательно: в прочитанных
 * источниках имя таблицы однозначно не зафиксировано (DrCrTurnover либо
 * DrCrTurnovers — см. `COMMON.accounting_virtual_tables._todo`), а угадывать
 * имя, которое уйдёт в боевой запрос, нельзя.
 */
export const ACCOUNTING_VIRTUAL_TABLES = [
  "Balance",
  "Turnovers",
  "BalanceAndTurnovers",
  "RecordsWithExtDimensions",
  "ExtDimensions",
] as const;

export const getAccountingBalanceSchema = z.object({
  register_name: z
    .string()
    .default("Хозрасчетный")
    .describe("Имя регистра бухгалтерии — с префиксом AccountingRegister_ или без него"),
  table: z
    .enum(ACCOUNTING_VIRTUAL_TABLES)
    .default("Balance")
    .describe(
      "Виртуальная таблица. Balance — остатки на дату (period). " +
      "Turnovers / BalanceAndTurnovers — за период (start_period + end_period). " +
      "RecordsWithExtDimensions / ExtDimensions — субконто. " +
      "Оборотов Дт/Кт в списке НЕТ: точное имя таблицы первоисточником не подтверждено — " +
      "сверьте по get_metadata своей базы.",
    ),
  period: odataDateTime
    .optional()
    .describe("Только для Balance: дата среза YYYY-MM-DDTHH:MM:SS."),
  start_period: odataDateTime
    .optional()
    .describe("Начало периода для Turnovers / BalanceAndTurnovers."),
  end_period: odataDateTime
    .optional()
    .describe("Конец периода для Turnovers / BalanceAndTurnovers."),
  condition: z
    .string()
    .optional()
    .describe("Отбор по измерениям (Condition), например \"Организация_Key eq guid'…'\""),
  account_condition: z
    .string()
    .optional()
    .describe(
      "Отбор по счетам (AccountCondition). ВНИМАНИЕ: имя параметра первоисточником " +
      "не подтверждено — если база ответит ошибкой, задайте параметр через extra.",
    ),
  extra: z
    .record(z.string(), z.string())
    .optional()
    .describe(
      "Прочие параметры вызова как есть: {\"Dimensions\": \"'Счет,Организация'\"}. " +
      "Значения — готовые OData-литералы; экранирование содержимого на вызывающем.",
    ),
});

export async function handleGetAccountingBalance(
  params: z.infer<typeof getAccountingBalanceSchema>,
): Promise<string> {
  // Кросс-полевые проверки живут здесь, а не в zod .refine(): server.tool()
  // получает только .shape, SDK пересобирает свой z.object, и refinement
  // уровня объекта молча теряется на каждом реальном вызове.
  const periodic = params.table === "Turnovers" || params.table === "BalanceAndTurnovers";
  if (params.table === "Balance" && (params.start_period || params.end_period)) {
    throw new Error(
      "Balance takes `period` (a point in time); start_period/end_period belong to Turnovers / BalanceAndTurnovers.",
    );
  }
  if (periodic && params.period) {
    throw new Error(
      `${params.table} takes start_period + end_period, not \`period\`.`,
    );
  }

  const args: Record<string, string> = {};
  if (params.period) args["Period"] = `datetime'${params.period}'`;
  if (params.start_period) args["StartPeriod"] = `datetime'${params.start_period}'`;
  if (params.end_period) args["EndPeriod"] = `datetime'${params.end_period}'`;
  if (params.condition) args["Condition"] = `'${escapeODataString(params.condition)}'`;
  if (params.account_condition) {
    args["AccountCondition"] = `'${escapeODataString(params.account_condition)}'`;
  }
  // extra идёт как есть — там могут быть литералы со своими кавычками.
  // Экранирование URL всё равно применит buildVirtualTablePath.
  Object.assign(args, params.extra ?? {});

  const path = buildVirtualTablePath(
    normaliseEntity("AccountingRegister_", params.register_name),
    params.table,
    args,
    { $format: "json" },
  );
  const result = await oneCGet(path);
  return JSON.stringify(result, null, 2);
}
