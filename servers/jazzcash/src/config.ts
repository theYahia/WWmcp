import { createRequire } from "node:module";

/**
 * JazzCash environment + endpoint configuration.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  ⚠️  ENDPOINT PATHS ARE BEST-EVIDENCE CANONICAL VALUES — CONFIRM AGAINST YOUR
 *      MERCHANT PORTAL.
 *
 *  JazzCash exposes the same logical operation under slightly different path
 *  conventions depending on the merchant-account generation (e.g.
 *  `/Payment/DoMWalletTransaction` vs `/2.0/Purchase/DoMWalletTransaction`), and
 *  the URL path version segment ("2.0", "4.0") is NOT the same thing as the
 *  `pp_Version` request field (fixed "1.1" for the documented Payment API).
 *
 *  The ONLY invariant confirmed across the official docs + multiple independent
 *  integrations is the host + `/ApplicationAPI/API/` prefix:
 *    • sandbox     → https://sandbox.jazzcash.com.pk/ApplicationAPI/API
 *    • production  → https://payments.jazzcash.com.pk/ApplicationAPI/API
 *
 *  The resource/action segments below follow the paths used by the closest
 *  comparable real integrations. Before transacting real money, verify each
 *  path (and whether `pp_Version` is expected) against the per-merchant API URLs
 *  shown in your JazzCash merchant portal after login.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const SANDBOX_BASE = "https://sandbox.jazzcash.com.pk/ApplicationAPI/API";
const PRODUCTION_BASE = "https://payments.jazzcash.com.pk/ApplicationAPI/API";

export type JazzCashEnv = "sandbox" | "production";

/**
 * Resolve the API base URL.
 * Precedence: explicit JAZZCASH_BASE_URL override → JAZZCASH_ENV → sandbox (safe default).
 */
export function resolveBaseUrl(): string {
  const override = process.env.JAZZCASH_BASE_URL?.trim();
  if (override) return override.replace(/\/+$/, "");

  const env = (process.env.JAZZCASH_ENV?.trim().toLowerCase() ?? "sandbox") as JazzCashEnv;
  return env === "production" ? PRODUCTION_BASE : SANDBOX_BASE;
}

export function resolveEnv(): JazzCashEnv {
  if (process.env.JAZZCASH_BASE_URL?.trim()) return "production"; // explicit override → treat as live
  return process.env.JAZZCASH_ENV?.trim().toLowerCase() === "production" ? "production" : "sandbox";
}

/** Canonical endpoint paths (appended to the base URL). See the warning block above. */
export const ENDPOINTS = {
  /** Mobile Wallet (MWALLET) and Mobile Account payments, and OTC vouchers (differ only by pp_TxnType). */
  PAYMENT: "/Payment/DoMWalletTransaction",
  /** Transaction status / payment inquiry. Canonical name is PaymentInquiry/Inquire. */
  INQUIRY: "/PaymentInquiry/Inquire",
  /** Refund. NOTE: per the JazzCash v4.2 guide, refunds apply to CARD transactions, not wallet/OTC. */
  REFUND: "/Payment/RefundTransaction",
} as const;

/** JazzCash transaction types. "Mobile Account" == MWALLET; there is no separate "MA" type. */
export const TXN_TYPE = {
  WALLET: "MWALLET",
  /** Over-The-Counter voucher. Gateway returns a voucher number redeemed offline at an outlet. */
  VOUCHER: "OTC",
} as const;

/**
 * pp_Version request field. The documented Payment API marks this mandatory with fixed value "1.1".
 * (Do NOT confuse with the URL path version segment.) Centralized here so it can be tuned per merchant.
 */
export const PP_VERSION = "1.1";

export const PP_LANGUAGE = "EN";
export const PP_CURRENCY = "PKR";

/** Response code that indicates success. Non-"000" on a write operation = failure. */
export const SUCCESS_CODE = "000";

/** Client-side guard against fat-fingered amounts (NOT a JazzCash limit). In rupees. */
export const MAX_AMOUNT_RUPEES = 1_000_000;

/** HTTP request timeout in milliseconds. */
export const REQUEST_TIMEOUT_MS = 15_000;

/** Package version, single-sourced from package.json (works for ESM + Node16, dist → root package.json). */
export function getPackageVersion(): string {
  try {
    const require = createRequire(import.meta.url);
    const pkg = require("../package.json") as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}
