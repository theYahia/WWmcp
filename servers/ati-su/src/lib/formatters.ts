/**
 * MCP response formatters.
 *
 * Tools declare an `outputSchema`, so successful results MUST carry
 * `structuredContent` (validated by the SDK against that schema). We return BOTH
 * `structuredContent` (machine-consumable) and a `content` text block (back-compat
 * for clients that only read text). Error results set `isError`, which the SDK
 * exempts from output-schema validation.
 */

/** Wraps a mapped result object as a successful tool response. Pass an object, never a bare array. */
export function success(data: Record<string, unknown>) {
  return {
    structuredContent: data,
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

/** Wraps a curated, model-safe message as an error tool response. */
export function error(message: string) {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true as const,
  };
}
