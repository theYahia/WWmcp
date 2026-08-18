import { z } from "zod";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Опциональное поле даты YYYY-MM-DD для MCP-схем. */
export function isoDateOptional(description: string) {
  return z.string().regex(ISO_DATE, "Дата в формате YYYY-MM-DD").optional().describe(description);
}

/** Обязательное поле даты YYYY-MM-DD для MCP-схем. */
export function isoDateRequired(description: string) {
  return z.string().regex(ISO_DATE, "Дата в формате YYYY-MM-DD").describe(description);
}
