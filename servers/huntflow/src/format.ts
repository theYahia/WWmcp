import { z, ZodTypeAny } from "zod";

/** Текстовый результат тула (без structuredContent) — для сырых/одиночных ответов. */
export function toolText(data: unknown): { content: { type: "text"; text: string }[] } {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

/** Результат тула с курированным structuredContent (требует outputSchema при регистрации). */
export function toolStructured(structured: unknown): {
  content: { type: "text"; text: string }[];
  structuredContent: Record<string, unknown>;
} {
  return {
    content: [{ type: "text", text: JSON.stringify(structured, null, 2) }],
    structuredContent: structured as Record<string, unknown>,
  };
}

/** Обёртка ответа-списка Huntflow: { page, count, total, total_items?, items[] }. */
export function listOutputSchema(item: ZodTypeAny) {
  return z
    .object({
      page: z.number().nullish(),
      count: z.number().nullish(),
      total: z.number().nullish(),
      total_items: z.number().nullish(),
      next_page_cursor: z.string().nullish(),
      items: z.array(item).optional(),
    })
    .passthrough();
}

function pick(obj: Record<string, unknown>, keys: readonly string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

/**
 * Курирует ответ-список: оставляет в items только ключевые поля (снижение токенов).
 * Сохраняет метаданные пагинации (page/count/total/total_items/next_page_cursor).
 * Если `raw` — возвращает сырой ответ как есть (валиден против passthrough-схемы).
 */
export function curateList(
  raw: unknown,
  keys: readonly string[],
  raw_mode = false,
): Record<string, unknown> {
  if (raw_mode || !isObj(raw))
    return (isObj(raw) ? raw : { value: raw }) as Record<string, unknown>;
  const items = Array.isArray(raw.items) ? raw.items : [];
  const out: Record<string, unknown> = {
    items: items.map((it) => (isObj(it) ? pick(it, keys) : it)),
  };
  for (const m of ["page", "count", "total", "total_items", "next_page_cursor"]) {
    if (raw[m] !== undefined) out[m] = raw[m];
  }
  return out;
}

// Наборы ключей курирования по сущностям (совпадают с zod-схемами в types.ts).
export const KEYS = {
  vacancy: ["id", "position", "company", "money", "state", "created", "priority"],
  applicant: [
    "id",
    "first_name",
    "last_name",
    "middle_name",
    "email",
    "phone",
    "position",
    "created",
  ],
  stage: ["id", "name", "type", "order", "removed"],
  account: ["id", "name", "nick", "member_type"],
  resume: ["id", "auth_type", "account_source", "created", "updated"],
  coworker: ["id", "name", "type", "email"],
  dict: ["id", "name", "type", "foreign", "order"],
} as const;
