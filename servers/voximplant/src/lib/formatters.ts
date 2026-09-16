import type { ApiResult } from "../client.js";

/** Результат MCP-инструмента (структурно совместим с CallToolResult SDK). */
export interface ToolResult {
  content: { type: "text"; text: string }[];
  isError?: boolean;
  [key: string]: unknown;
}

export function success(data: unknown): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

export function error(message: string): ToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify({ error: message }, null, 2) }],
    isError: true,
  };
}

export function noResults(note = "Ничего не найдено за указанный период."): ToolResult {
  return success({ result: [], note });
}

/**
 * Превращает `ApiResult` в `ToolResult`: ошибка → `isError`, иначе применяет
 * необязательный шейпер к data и pretty-печатает.
 */
export function fromResult<T>(res: ApiResult<T>, shape?: (data: T) => unknown): ToolResult {
  if (res.error !== null) return error(res.error);
  const shaped = shape ? shape(res.data) : res.data;
  return success(shaped);
}
