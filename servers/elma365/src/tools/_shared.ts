import { z } from "zod";

/**
 * Общие zod-поля пагинации для list-инструментов.
 * ELMA365 ограничивает `size` значением 10000 (POST .../list).
 * `.default()` гарантирует, что значения реально проставляются на уровне MCP,
 * а не только документируются (в отличие от прежних `.optional()`).
 */
export const pagingShape = {
  from: z.number().int().min(0).max(1_000_000).default(0)
    .describe("Смещение для пагинации (по умолчанию 0)"),
  size: z.number().int().min(1).max(10_000).default(50)
    .describe("Количество элементов, 1–10000 (по умолчанию 50)"),
};

/** Описание одного правила сортировки в ELMA365 (`sortExpressions[]`). */
export const sortExpressionSchema = z.object({
  field: z.string().min(1).describe("Код поля для сортировки"),
  ascending: z.boolean().default(true).describe("По возрастанию (true) или убыванию (false)"),
});

/**
 * Собирает тело POST-запроса для list-эндпоинтов, отбрасывая undefined-поля.
 * Покрывает общий набор параметров фильтрации ELMA365.
 */
export function buildListBody(params: {
  from?: number;
  size?: number;
  active?: boolean;
  filter?: Record<string, unknown>;
  sortExpressions?: Array<{ field: string; ascending?: boolean }>;
  ids?: string[];
  statusCode?: string[];
  closed?: boolean;
}): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) body[key] = value;
  }
  return body;
}

/** Единый формат текстового вывода инструментов: читаемый JSON. */
export function formatResult(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Извлекает первый элемент из конверта-списка ELMA365
 * ({ result: { result: [...] } } | { result: [...] } | [...]).
 * Возвращает undefined, если массив пуст или структура иная — вызывающий код
 * может откатиться к полному ответу.
 */
export function extractFirstItem(data: unknown): unknown {
  const arr = pickListArray(data);
  return arr && arr.length > 0 ? arr[0] : undefined;
}

function pickListArray(data: unknown): unknown[] | undefined {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const inner = (data as Record<string, unknown>).result;
    if (Array.isArray(inner)) return inner;
    if (inner && typeof inner === "object") {
      const deep = (inner as Record<string, unknown>).result;
      if (Array.isArray(deep)) return deep;
    }
  }
  return undefined;
}
