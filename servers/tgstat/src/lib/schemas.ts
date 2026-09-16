/**
 * Shared Zod schemas.
 */

import { z } from "zod";

const YMD = /^\d{4}-\d{2}-\d{2}$/;

/**
 * An optional YYYY-MM-DD date. The regex pins the format and the refine rejects
 * impossible calendar dates (e.g. 2026-13-01), so an invalid date fails Zod
 * validation with a clear message instead of reaching toUnix() and throwing.
 */
export function optionalDate(description: string) {
  return z
    .string()
    .regex(YMD, "Use date format YYYY-MM-DD")
    .refine((d) => !Number.isNaN(Date.parse(`${d}T00:00:00Z`)), "Not a valid calendar date")
    .optional()
    .describe(description);
}
