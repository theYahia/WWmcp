/** Small shared helpers for tolerant parsing of Pochta API responses. */

/** Narrow an unknown value to a plain object, or undefined. */
export function asRecord(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : undefined;
}

/**
 * Return the first non-null/undefined value among `keys`.
 *
 * The otpravka APIs are inconsistent about field casing across endpoints
 * (kebab-case `postal-code` vs snake_case `postal_code`), so callers pass
 * every plausible spelling and `pick` returns whichever the API actually sent.
 */
export function pick(obj: Record<string, unknown> | undefined, ...keys: string[]): unknown {
  if (!obj) return undefined;
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
}

/** Coerce a picked value to a string, or null. */
export function asString(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  return typeof v === "string" ? v : String(v);
}

/** Coerce a picked value to a number, or null. */
export function asNumber(v: unknown): number | null {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  return null;
}
