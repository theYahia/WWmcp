import { z } from "zod";
import { oneCGet, buildODataPath, buildVirtualTablePath, escapeODataString } from "../client.js";
import { normaliseEntity, odataDateTime } from "../validation.js";
import { buildQuery, pageJson } from "../lib/paging.js";
import { periodArgs, requireStableOrder } from "../lib/virtual-tables.js";

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
  const query = buildQuery(params);
  const path = buildODataPath(normaliseEntity("AccountingRegister_", params.register_name), query);
  const result = await oneCGet(path);
  return pageJson(result, params.top, params.skip);
}

// ──────────────────────────────────────────────────────────────
// get_accounting_balance — виртуальные таблицы регистра бухгалтерии
// (остатки, обороты, субконто). Раньше не покрывались ни одним
// инструментом: buildODataPath кодирует '/' и скобки вызова.
// ──────────────────────────────────────────────────────────────

/**
 * Таблицы, чьи ИМЕНА подтверждены источниками из `presets/common.ts`.
 */
export const ACCOUNTING_VIRTUAL_TABLES = [
  "Balance",
  "Turnovers",
  "BalanceAndTurnovers",
  "RecordsWithExtDimensions",
  "ExtDimensions",
] as const;

/**
 * Обороты по дебету/кредиту: таблица в платформе есть, но её имя в прочитанных
 * источниках однозначно не зафиксировано — DrCrTurnover либо DrCrTurnovers
 * (см. `COMMON.accounting_virtual_tables._unsupported`). Угадывать имя, которое уйдёт
 * в боевой запрос, нельзя.
 *
 * Раньше эти имена просто не попадали в enum, и вызов отбивался «invalid enum
 * value». Из такого ответа не следует ни что таблица существует, ни что с этим
 * делать дальше — молчание вместо объяснения. Теперь имена принимаются, а
 * инструмент говорит, чего именно не хватает и как это подтвердить на базе.
 */
export const UNCONFIRMED_ACCOUNTING_TABLES = ["DrCrTurnover", "DrCrTurnovers"] as const;

export const getAccountingBalanceSchema = z.object({
  register_name: z
    .string()
    .default("Хозрасчетный")
    .describe("Имя регистра бухгалтерии — с префиксом AccountingRegister_ или без него"),
  table: z
    .enum([...ACCOUNTING_VIRTUAL_TABLES, ...UNCONFIRMED_ACCOUNTING_TABLES])
    .default("Balance")
    .describe(
      "Виртуальная таблица. Balance — остатки на дату (period). " +
      "Turnovers / BalanceAndTurnovers — за период (start_period + end_period). " +
      "RecordsWithExtDimensions / ExtDimensions — субконто. " +
      "DrCrTurnover / DrCrTurnovers (обороты Дт/Кт) НЕ поддержаны: имя таблицы " +
      "первоисточником не подтверждено. Вызов вернёт объяснение и путь в обход. " +
      "Turnovers уже раскладывает обороты по корреспондирующим счетам (BalancedAccount_Key).",
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
      "Прочие параметры вызова как есть: {\"Имя\": \"<готовый OData-литерал>\"}; " +
      "экранирование содержимого на вызывающем. Dimensions регистр бухгалтерии НЕ " +
      "принимает (1С отвечает 500 «Field not found PeriodAdjustment») — чтобы свернуть " +
      "строки до нужных измерений, перечислите их в select.",
    ),
  select: z
    .string()
    .optional()
    .describe(
      "OData $select. Главный рычаг против лимита ответа: 1С сворачивает строки по " +
      "выбранным полям, например \"Account_Key,ExtDimension1,BalancedAccount_Key," +
      "СуммаTurnoverDr,СуммаTurnoverCr\".",
    ),
  filter: z.string().optional().describe("OData $filter по полям таблицы, например \"СуммаTurnoverDr gt 0\""),
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

export async function handleGetAccountingBalance(
  params: z.infer<typeof getAccountingBalanceSchema>,
): Promise<string> {
  // Кросс-полевые проверки живут здесь, а не в zod .refine(): server.tool()
  // получает только .shape, SDK пересобирает свой z.object, и refinement
  // уровня объекта молча теряется на каждом реальном вызове.
  if ((UNCONFIRMED_ACCOUNTING_TABLES as readonly string[]).includes(params.table)) {
    // odata_query здесь не выход: он URL-кодирует всё имя сущности, и `/` перед
    // именем таблицы уходит как %2F — веб-сервер публикации отвечает 404 (проверено
    // на живой базе БП 3.0). Советовать его значит отправлять модель в тупик.
    throw new Error(
      `Обороты Дт/Кт (${params.table}) инструментом не поддержаны: точное имя виртуальной ` +
      "таблицы — DrCrTurnover или DrCrTurnovers — ни в одном прочитанном источнике не " +
      "зафиксировано, а неверное имя даст 404 без внятной причины. odata_query виртуальную " +
      "таблицу не адресует: он кодирует `/` в имени, и публикация отвечает 404. " +
      "Что делать сейчас: table=Turnovers уже раскладывает обороты счёта по " +
      "корреспондирующим счетам (BalancedAccount_Key, СуммаTurnoverDr / СуммаTurnoverCr); " +
      "остатки и обороты по счёту — table=BalanceAndTurnovers. Фактическое имя таблицы " +
      "из get_metadata / describe_entity своей базы стоит прислать в проект — задача WORK-1516.",
    );
  }
  const args = periodArgs(params.table, params);
  requireStableOrder(params);
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
    buildQuery(params),
  );
  const result = await oneCGet(path);
  // Без top — Infinity: конверт тот же, has_more=true только если ответ обрезан.
  return pageJson(result, params.top ?? Number.POSITIVE_INFINITY, params.skip ?? 0);
}
