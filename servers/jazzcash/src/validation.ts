import { z } from "zod";
import { randomInt } from "node:crypto";
import { MAX_AMOUNT_RUPEES } from "./config.js";

/** Pakistani mobile number / MSISDN: 03 followed by 9 digits (e.g. 03001234567). */
export const pkMobile = z
  .string()
  .trim()
  .regex(/^03\d{9}$/, "Mobile number must be in the format 03XXXXXXXXX (11 digits)");

/** Last 6 digits of the customer CNIC (national ID). */
export const cnic6 = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "CNIC must be exactly the last 6 digits");

/**
 * Payment amount in RUPEES (PKR). Converted to paisa (× 100) before hitting the gateway,
 * because JazzCash's pp_Amount is expressed in the lowest denomination with no decimal point.
 */
export const amountRupees = z
  .number()
  .positive("Amount must be greater than zero")
  .max(MAX_AMOUNT_RUPEES, `Amount must not exceed ${MAX_AMOUNT_RUPEES} PKR`);

/** Optional caller-supplied transaction reference. Auto-generated when omitted. */
export const txnRef = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_-]{1,32}$/, "Transaction reference must be 1-32 chars of A-Z a-z 0-9 _ -")
  .optional();

/** Optional merchant bill reference for reconciliation. Defaults to the transaction reference. */
export const billReference = z
  .string()
  .trim()
  .min(1)
  .max(50)
  .optional();

/** Convert a rupee amount to an integer paisa string (JazzCash pp_Amount format). */
export function toPaisa(rupees: number): string {
  return Math.round(rupees * 100).toString();
}

/**
 * Generate a unique transaction reference: "T" + yyyyMMddHHmmss + 4 random digits.
 * Matches JazzCash's conventional T-prefixed datetime scheme.
 */
export function generateTxnRef(dateTime: string): string {
  const suffix = randomInt(0, 10_000).toString().padStart(4, "0");
  return `T${dateTime}${suffix}`;
}
