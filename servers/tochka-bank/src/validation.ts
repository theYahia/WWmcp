import { z } from "zod";

// Reusable validators for Russian banking identifiers. These run before any
// value reaches the bank API (or, worse, a payment), so malformed identifiers
// are rejected with a clear message instead of an opaque API error.

/**
 * Russian INN checksum (10 or 12 digits). Returns false for the wrong length
 * or a failed control-digit check.
 */
export function isValidInn(inn: string): boolean {
  if (!/^\d{10}$|^\d{12}$/.test(inn)) return false;
  const d = inn.split("").map(Number);
  const mod = (weights: number[]): number => {
    const sum = weights.reduce((acc, w, i) => acc + w * d[i], 0);
    return (sum % 11) % 10;
  };
  if (d.length === 10) {
    return mod([2, 4, 10, 3, 5, 9, 4, 6, 8]) === d[9];
  }
  const n11 = mod([7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
  const n12 = mod([3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
  return n11 === d[10] && n12 === d[11];
}

export const bikSchema = z.string().regex(/^\d{9}$/, "BIK must be exactly 9 digits");

export const innSchema = z
  .string()
  .regex(/^\d{10}$|^\d{12}$/, "INN must be 10 or 12 digits")
  .refine(isValidInn, "INN checksum is invalid");

export const accountSchema = z
  .string()
  .regex(/^\d{20}$/, "Account number must be exactly 20 digits");

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

/** Positive ruble amount with a hard upper bound. */
export function amountRubSchema(maxRub: number) {
  return z
    .number()
    .positive("Amount must be positive")
    .max(maxRub, `Amount exceeds the configured limit of ${maxRub} RUB`);
}
