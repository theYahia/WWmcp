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

/**
 * Бюджет символов на ответ инструмента.
 *
 * Последняя линия — `truncateResponse` в `@theyahia/mcp-core`: она режет по символам
 * на 50 000 и с высокой вероятностью рвёт JSON посреди записи. Модель получает
 * синтаксически невалидный документ и додумывает недостающее — для продукта, который
 * продаёт совпадение цифр, это худший из отказов: он выглядит как работа.
 *
 * Поэтому обрезаем раньше и по целым записям. Запас в 5 000 символов оставлен ядру:
 * `sanitizeApiResponse` заменяет найденные шаблоны на `[filtered]` и может немного
 * удлинить текст. Лимит в ядре не трогаем — он общий для всех серверов монорепы.
 */
const RESPONSE_BUDGET = 45_000;

const TRUNCATED_NOTE =
  "Ответ обрезан по целым записям, чтобы остаться валидным JSON. " +
  "Отброшенные записи не потеряны: сузьте $filter, уменьшите top или возьмите " +
  "следующую страницу. Считать по этой выборке итоги и «сколько всего» нельзя.";

/**
 * Компактный JSON с обрезкой по записям, а не по символам.
 *
 * `arrayKey` — поле-массив, которое можно укоротить (`value`, `rows`, `results`).
 * Если ответ влезает в бюджет — отдаётся как есть, без лишних полей. Если нет —
 * добавляются `truncated` (сколько записей отброшено) и `note`.
 */
export function stringifyCapped(payload: unknown, arrayKey: string): string {
  const full = JSON.stringify(payload);
  if (full.length <= RESPONSE_BUDGET) return full;
  if (!payload || typeof payload !== "object") return full;

  const envelope = payload as Record<string, unknown>;
  const items = envelope[arrayKey];
  // Не массив — резать по записям нечего; дальше сработает страховка ядра.
  if (!Array.isArray(items)) return full;

  // Сколько записей влезает: один проход с накоплением, без подбора.
  let used = JSON.stringify({
    ...envelope,
    [arrayKey]: [],
    truncated: items.length,
    note: TRUNCATED_NOTE,
  }).length;
  let keep = 0;
  for (const item of items) {
    const len = JSON.stringify(item).length + 1; // +1 на запятую-разделитель
    if (used + len > RESPONSE_BUDGET) break;
    used += len;
    keep++;
  }

  return JSON.stringify({
    ...envelope,
    [arrayKey]: items.slice(0, keep),
    truncated: items.length - keep,
    note: TRUNCATED_NOTE,
  });
}

/** `toPage` + компактная сериализация с обрезкой по записям. */
export function pageJson(result: unknown, top: number, skip?: number): string {
  return stringifyCapped(toPage(result, top, skip), "value");
}
