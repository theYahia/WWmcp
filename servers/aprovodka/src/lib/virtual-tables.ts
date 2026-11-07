/**
 * Общие правила виртуальных таблиц регистров (Balance / Turnovers /
 * BalanceAndTurnovers) — для регистров бухгалтерии и накопления сразу.
 *
 * Раньше проверки периода жили только в get_accounting_balance. Обороты регистра
 * накопления требуют тех же правил, и вторая копия разъехалась бы с первой при
 * первой же правке текста ошибки или новой таблице.
 */

/** Таблицы, которым нужен период (StartPeriod + EndPeriod), а не дата среза. */
const PERIODIC_TABLES = new Set(["Turnovers", "BalanceAndTurnovers"]);

export interface PeriodParams {
  period?: string;
  start_period?: string;
  end_period?: string;
}

/**
 * Аргументы периода для вызова виртуальной таблицы.
 *
 * Только отклоняет заведомо неверные сочетания и собирает литералы — ничего нового
 * не делает обязательным: прочие таблицы (RecordsWithExtDimensions, ExtDimensions)
 * получают ровно то, что передал вызывающий.
 *
 * Проверки здесь, а не в zod .refine(): server.tool() получает только .shape, SDK
 * пересобирает свой z.object, и refinement уровня объекта молча теряется на
 * каждом реальном вызове.
 */
export function periodArgs(table: string, p: PeriodParams): Record<string, string> {
  if (table === "Balance" && (p.start_period || p.end_period)) {
    throw new Error(
      "Balance takes `period` (a point in time); start_period/end_period belong to Turnovers / BalanceAndTurnovers.",
    );
  }
  if (PERIODIC_TABLES.has(table) && p.period) {
    throw new Error(`${table} takes start_period + end_period, not \`period\`.`);
  }

  const args: Record<string, string> = {};
  if (p.period) args["Period"] = `datetime'${p.period}'`;
  if (p.start_period) args["StartPeriod"] = `datetime'${p.start_period}'`;
  if (p.end_period) args["EndPeriod"] = `datetime'${p.end_period}'`;
  return args;
}

export interface PageParams {
  top?: number;
  skip?: number;
  orderby?: string;
}

/**
 * Страницы виртуальной таблицы — только при явном порядке.
 *
 * Без $orderby 1С не обещает, что строки придут в том же порядке при следующем
 * запросе: вторая страница может повторить строки первой или пропустить часть.
 * Модель сложит страницы и получит неверную сумму — тихая ошибка. Поэтому
 * top/skip без orderby — отказ с подсказкой, а не запрос.
 */
export function requireStableOrder(p: PageParams): void {
  if ((p.top !== undefined || (p.skip ?? 0) > 0) && !p.orderby) {
    throw new Error(
      "top/skip на виртуальной таблице требуют orderby: без явного порядка 1С не обещает " +
        "одинаковую последовательность строк, и страницы могут повторять или терять записи. " +
        "Задайте orderby по измерениям из select (например, \"Account_Key,ExtDimension1\"), " +
        "либо уберите top/skip и сократите ответ через select / filter / короткий период.",
    );
  }
}
