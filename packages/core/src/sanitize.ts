/**
 * Output sanitization for API responses.
 *
 * Protects against prompt injection attacks where malicious content
 * in API responses could manipulate LLM behavior.
 */

/** Patterns that attempt to override LLM instructions */
const INJECTION_PATTERNS = [
  // Артикль/квантор между глаголом и объектом необязателен и не ограничен `all`:
  // «disregard the above instructions» и «override any prior rules» — та же атака,
  // а без этой группы они проходили насквозь.
  /\b(ignore|forget|disregard|override)\s+((all|the|any|these|those)\s+)?(previous|prior|above|earlier|system)\s+(instructions?|prompts?|rules?|context|constraints?)/gi,
  /\b(you\s+are\s+now|act\s+as|pretend\s+to\s+be|switch\s+to|new\s+instructions?:)/gi,
  /\bsystem\s*:\s*you\s+(are|must|should|will)/gi,
  /<\/?system>/gi,
];

/**
 * Sanitizes text returned from external APIs before passing to LLM.
 * Strips potential prompt injection patterns.
 */
export function sanitizeApiResponse(text: string): string {
  let result = text;
  for (const pattern of INJECTION_PATTERNS) {
    result = result.replace(pattern, "[filtered]");
  }
  return result;
}

/**
 * Truncates response text if it exceeds maxLength.
 * Appends a note about truncation for the LLM.
 */
export function truncateResponse(
  text: string,
  maxLength: number = 50_000,
): string {
  if (text.length <= maxLength) return text;
  return (
    text.slice(0, maxLength) +
    `\n\n[Truncated: response was ${text.length} chars, showing first ${maxLength}. Use pagination or filters to narrow results.]`
  );
}
