/**
 * MCP response formatters.
 *
 * Tool handlers return one of these shapes. `error()` sets `isError` so the MCP
 * client can distinguish failures from successful payloads without parsing.
 */

import type { ApiResult } from "../types.js";

export function success(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function error(message: string) {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true as const,
  };
}

export function noResults(message: string) {
  return success({ status: "no_results", message });
}

/**
 * Bridge an {@link ApiResult} to an MCP response: error → `error()`, otherwise
 * the shaped data → `success()`. `shape` lets each tool curate the payload.
 */
export function fromResult(result: ApiResult, shape: (data: unknown) => unknown = (d) => d) {
  if (result.error !== null) return error(result.error);
  return success(shape(result.data));
}
