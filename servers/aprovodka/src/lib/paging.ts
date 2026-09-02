/**
 * Честный признак незавершённой выдачи.
 *
 * `$top` у читающих инструментов по умолчанию 100. Без этого признака модель не
 * отличает «все 40 документов» от «первых 100 из 12 000»: она сложит первую сотню
 * и уверенно назовёт это итогом. Для продукта, который продаёт совпадение цифр,
 * это худший отказ — он выглядит как работа.
 *
 * Приём: запрашиваем на одну запись больше, чем нужно модели. Лишняя запись и есть
 * доказательство, что дальше есть ещё; в ответ она не попадает. Один лишний ряд
 * дешевле `$inlinecount`, который заставляет 1С считать всю выборку.
 */

export interface Page {
  value: unknown[];
  returned: number;
  has_more: boolean;
  next_skip?: number;
}

/** Значение `$top` для запроса: на одну запись больше запрошенного. */
export function probeTop(top: number): string {
  return String(top + 1);
}

/**
 * Обрезать ответ 1С до `top` записей и сказать, есть ли продолжение.
 *
 * Прочие поля ответа (например `odata.count` при `$inlinecount`) сохраняются.
 * Ответ не в форме `{ value: [...] }` — единичная сущность, конверт ошибки —
 * проходит как есть.
 *
 * `skip` передают только инструменты, у которых он есть в схеме: `next_skip` там,
 * где его некуда подставить, — подсказка в никуда.
 */
export function toPage(result: unknown, top: number, skip?: number): unknown {
  if (!result || typeof result !== "object") return result;

  const rest = { ...(result as Record<string, unknown>) };
  const rows = rest["value"];
  if (!Array.isArray(rows)) return result;
  delete rest["value"];

  const has_more = rows.length > top;
  const value = has_more ? rows.slice(0, top) : rows;

  const page: Record<string, unknown> = {
    ...rest,
    value,
    returned: value.length,
    has_more,
  };
  if (has_more && skip !== undefined) page["next_skip"] = skip + value.length;
  return page;
}
