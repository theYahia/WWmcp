import { createHmac, timingSafeEqual } from "node:crypto";
import { createLogger } from "@theyahia/mcp-core";
import {
  resolveBaseUrl,
  REQUEST_TIMEOUT_MS,
  PP_VERSION,
  PP_LANGUAGE,
  PP_CURRENCY,
} from "./config.js";
import type { JazzCashResponse } from "./types.js";

export const logger = createLogger("jazzcash-mcp");

/** Fields whose values must never be surfaced back to the caller / logs. */
const SENSITIVE_KEY = /password|securehash/i;

export interface BaseFieldOptions {
  /** Include pp_TxnDateTime (default true). */
  dateTime?: boolean;
  /** Include pp_TxnExpiryDateTime (default false). */
  expiry?: boolean;
  /** Include pp_TxnCurrency (default true). */
  currency?: boolean;
  /** Include pp_Language (default true). */
  language?: boolean;
  /** Include pp_Version (default true). */
  version?: boolean;
}

// ponytail: own client, not core BaseHttpClient — the request is an HMAC-signed form with a
// verified response hash, a non-JSON 200 is mapped to {pp_ResponseCode, pp_ResponseMessage}, and an
// error body is redacted to stderr only. POSTs are never retried here, same as in core.
export class JazzCashClient {
  private merchantId: string;
  private password: string;
  private integritySalt: string;
  private baseUrl: string;

  constructor() {
    this.merchantId = process.env.JAZZCASH_MERCHANT_ID ?? "";
    this.password = process.env.JAZZCASH_PASSWORD ?? "";
    this.integritySalt = process.env.JAZZCASH_INTEGRITY_SALT ?? "";
    if (!this.merchantId || !this.password || !this.integritySalt) {
      throw new Error(
        "Environment variables JAZZCASH_MERCHANT_ID, JAZZCASH_PASSWORD, and JAZZCASH_INTEGRITY_SALT are required. " +
        "Get credentials from the JazzCash merchant portal."
      );
    }
    this.baseUrl = resolveBaseUrl();
  }

  /**
   * Compute the JazzCash pp_SecureHash.
   *
   * Algorithm (verified against the official sandbox docs + an official worked
   * test vector reproduced byte-for-byte — see __tests__/tools.test.ts):
   *   message = IntegritySalt + "&" + sortedNonEmptyValues.join("&")
   *   hash    = lowercaseHex( HMAC_SHA256(key = IntegritySalt, data = message) )
   *
   * ⚠️ DO NOT "fix" the following — both are load-bearing and confirmed correct:
   *   • The IntegritySalt is BOTH prepended to the message AND used as the HMAC key.
   *   • The output is LOWERCASE hex (JazzCash compares case-insensitively).
   * The one real bug this replaces: empty/undefined values must be EXCLUDED from
   * the concatenation, otherwise a blank optional field (e.g. pp_Description) injects
   * a spurious "&&" and the hash never matches.
   */
  generateHash(fields: Record<string, string>): string {
    const keys = Object.keys(fields)
      .filter((k) => k !== "pp_SecureHash" && fields[k] !== undefined && fields[k] !== null && fields[k] !== "")
      .sort();
    const message = this.integritySalt + "&" + keys.map((k) => fields[k]).join("&");
    return createHmac("sha256", this.integritySalt).update(message, "utf8").digest("hex");
  }

  /**
   * Recompute the secure hash over a JazzCash response and compare (case-insensitive,
   * constant-time) against the returned pp_SecureHash. Returns true when the response
   * either carries no hash (nothing to verify) or the hash matches.
   */
  verifyResponseHash(response: JazzCashResponse): boolean {
    const provided = response.pp_SecureHash;
    if (!provided || typeof provided !== "string") return true; // no hash to verify

    const stringFields: Record<string, string> = {};
    for (const [k, v] of Object.entries(response)) {
      if (k === "pp_SecureHash") continue;
      if (v === undefined || v === null) continue;
      stringFields[k] = String(v);
    }
    const expected = this.generateHash(stringFields);

    const a = Buffer.from(expected.toLowerCase());
    const b = Buffer.from(provided.toLowerCase());
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  private formatDateTime(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    return `${y}${m}${day}${h}${min}${s}`;
  }

  getFormattedDateTime(): string {
    return this.formatDateTime(new Date());
  }

  getExpiryDateTime(hours = 1): string {
    const d = new Date();
    d.setHours(d.getHours() + hours);
    return this.formatDateTime(d);
  }

  /** Common authentication/envelope fields shared by every request. */
  buildBaseFields(opts: BaseFieldOptions = {}): Record<string, string> {
    const { dateTime = true, expiry = false, currency = true, language = true, version = true } = opts;
    const fields: Record<string, string> = {
      pp_MerchantID: this.merchantId,
      pp_Password: this.password,
    };
    if (version) fields.pp_Version = PP_VERSION;
    if (language) fields.pp_Language = PP_LANGUAGE;
    if (currency) fields.pp_TxnCurrency = PP_CURRENCY;
    if (dateTime) fields.pp_TxnDateTime = this.getFormattedDateTime();
    if (expiry) fields.pp_TxnExpiryDateTime = this.getExpiryDateTime();
    return fields;
  }

  /** Sign, POST, verify the response hash, and return the sanitized response. */
  async submit(path: string, fields: Record<string, string>): Promise<JazzCashResponse> {
    fields.pp_SecureHash = this.generateHash(fields);
    const result = (await this.post(path, fields)) as JazzCashResponse;

    if (!this.verifyResponseHash(result)) {
      throw new Error(
        "JazzCash response failed secure-hash verification — the response may have been tampered with."
      );
    }
    return this.sanitizeResponse(result);
  }

  /** Strip credential/hash fields before returning a response to the caller. */
  sanitizeResponse(response: JazzCashResponse): JazzCashResponse {
    const clean: JazzCashResponse = {};
    for (const [k, v] of Object.entries(response)) {
      if (SENSITIVE_KEY.test(k)) continue;
      clean[k] = v;
    }
    return clean;
  }

  private async post(path: string, body: Record<string, string>): Promise<unknown> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        // Do NOT surface the raw upstream body — it can echo pp_Password / PII and is an
        // attacker-influenced prompt-injection vector. Log redacted detail to stderr only.
        const text = await response.text().catch(() => "");
        logger.error("JazzCash HTTP error", { status: response.status, path, body: redactString(text) });
        throw new Error(`JazzCash request failed (HTTP ${response.status}).`);
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        return response.json();
      }
      return { pp_ResponseCode: String(response.status), pp_ResponseMessage: await response.text() };
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error(`JazzCash: request timeout (${REQUEST_TIMEOUT_MS / 1000}s). Try again later.`);
      }
      throw error;
    }
  }
}

/** Redact secret-bearing substrings before logging. */
function redactString(text: string): string {
  return text.replace(/("?pp_(?:Password|SecureHash|CNIC|MobileNumber)"?\s*[:=]\s*"?)([^",&}\s]+)/gi, "$1***");
}

let _client: JazzCashClient | null = null;

/** Shared lazily-created client. Replaces the per-tool singleton copies. */
export function getClient(): JazzCashClient {
  return (_client ??= new JazzCashClient());
}

/** Reset the shared client (used by tests after stubbing env vars). */
export function resetClient(): void {
  _client = null;
}
