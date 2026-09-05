import { z } from "zod";
import type { YooKassaError } from "./types.js";

const BASE_URL = "https://api.yookassa.ru/v3";
// YooKassa may take up to ~30s to produce an answer (HTTP 500 means "no answer in time").
// Keep the client timeout above that window so a slow-but-successful create is not aborted
// client-side and then retried. Retries are safe because the Idempotence-Key is stable.
const TIMEOUT = 35_000;
const MAX_RETRIES = 3;

/** Opt-in request tracing (never logs secrets, auth header, or request bodies/card numbers). */
function debugEnabled(): boolean {
  return process.env.YOOKASSA_DEBUG === "1" || process.env.YOOKASSA_DEBUG === "true";
}
function debugLog(message: string): void {
  if (debugEnabled()) console.error(`[yookassa-mcp][debug] ${message}`);
}

let _instance: YooKassaClient | null = null;
let _payoutInstance: YooKassaClient | null = null;

/** Lazy singleton -- created on first use so tests can set env vars before import */
export function getClient(): YooKassaClient {
  if (!_instance) _instance = new YooKassaClient();
  return _instance;
}

/**
 * Client for the Payouts API. YooKassa Payouts is a separately-activated product that
 * authenticates with its OWN gateway credentials (agentId + payout secret), distinct from
 * the shop's payment-acceptance key. If YOOKASSA_PAYOUT_AGENT_ID + YOOKASSA_PAYOUT_SECRET_KEY
 * are set, they are used; otherwise this falls back to the shop credentials (which will
 * usually NOT work for payouts — see README/SECURITY).
 */
export function getPayoutClient(): YooKassaClient {
  const agentId = process.env.YOOKASSA_PAYOUT_AGENT_ID;
  const secret = process.env.YOOKASSA_PAYOUT_SECRET_KEY;
  if (agentId && secret) {
    if (!_payoutInstance) _payoutInstance = new YooKassaClient(agentId, secret);
    return _payoutInstance;
  }
  return getClient();
}

/** Reset singletons (for tests) */
export function resetClient(): void {
  _instance = null;
  _payoutInstance = null;
}

export class YooKassaClient {
  private authHeader: string;

  constructor(shopId?: string, secretKey?: string) {
    const sid = shopId ?? process.env.YOOKASSA_SHOP_ID ?? "";
    const key = secretKey ?? process.env.YOOKASSA_SECRET_KEY ?? "";

    if (!sid || !key) {
      throw new Error(
        "Environment variables YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY are required. " +
        "Get them in the YooKassa dashboard: Integration -> API Keys"
      );
    }

    this.authHeader = "Basic " + Buffer.from(`${sid}:${key}`).toString("base64");
  }

  async get(path: string): Promise<unknown> {
    return this.request("GET", path);
  }

  async post(path: string, body?: unknown, idempotencyKey?: string): Promise<unknown> {
    return this.request("POST", path, body, idempotencyKey);
  }

  async delete(path: string, idempotencyKey?: string): Promise<unknown> {
    return this.request("DELETE", path, undefined, idempotencyKey);
  }

  private async request(method: string, path: string, body?: unknown, idempotencyKey?: string): Promise<unknown> {
    // Tool ids go straight into the path (`/payments/${payment_id}/capture`,
    // `/webhooks/${webhook_id}`) and are typed as plain strings. fetch normalises
    // `..` before sending, so a model-supplied id like `x/../../me` would reach an
    // endpoint no tool exposes, carrying the shop's Basic credentials. No YooKassa
    // id or path contains `..`.
    if (/(^|\/)\.\.(\/|$)/.test(path)) {
      throw new Error(`YooKassa: path traversal blocked in "${path}" (an id must not contain "..").`);
    }
    const url = `${BASE_URL}${path}`;

    // The Idempotence-Key is generated ONCE per logical operation and reused on every
    // retry attempt. YooKassa treats a retry carrying the same body but a DIFFERENT key
    // as a brand-new request ("если данные в запросе те же, а ключ идемпотентности
    // отличается, запрос выполняется как новый") — regenerating it per attempt would
    // duplicate a payment/refund/payout. Required for POST and DELETE.
    const needsKey = method === "POST" || method === "DELETE";
    const key = needsKey ? (idempotencyKey ?? crypto.randomUUID()) : undefined;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT);
      const startedAt = Date.now();

      const headers: Record<string, string> = {
        "Authorization": this.authHeader,
        "Content-Type": "application/json",
      };

      if (key) {
        headers["Idempotence-Key"] = key;
      }

      try {
        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
        clearTimeout(timer);
        debugLog(`${method} ${path} -> ${response.status} (${Date.now() - startedAt}ms, attempt ${attempt}/${MAX_RETRIES}${key ? `, idem ${key}` : ""})`);

        // DELETE with 204 returns no content
        if (response.ok && response.status === 204) {
          return { success: true };
        }

        if (response.ok) {
          return response.json();
        }

        const errorBody = await response.text();
        let parsed: YooKassaError | null = null;
        try {
          parsed = JSON.parse(errorBody) as YooKassaError;
        } catch {
          // not JSON
        }

        // Retry on 429 and 5xx
        if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
          const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
          console.error(`[yookassa-mcp] ${response.status} from ${path}, retry in ${delay}ms (${attempt}/${MAX_RETRIES})`);

          if (response.status >= 500 && needsKey) {
            // 5xx means the operation result is undefined server-side; the retry reuses the
            // same Idempotence-Key, so YooKassa de-duplicates it (returns the original result
            // rather than creating a second payment/refund/payout). If retries are exhausted,
            // verify the final state with a GET before assuming failure.
            console.error("[yookassa-mcp] WARNING: HTTP 5xx -- result undefined; retrying with the same Idempotence-Key (verify via GET if it ultimately fails).");
          }

          await new Promise(r => setTimeout(r, delay));
          continue;
        }

        // Readable error
        if (parsed?.type === "error") {
          const hint = response.status === 401
            ? " Check YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY."
            : "";
          const param = parsed.parameter ? ` (param: ${parsed.parameter})` : "";
          throw new Error(`YooKassa [${parsed.code}]: ${parsed.description}${param}${hint}`);
        }

        // Non-JSON / unexpected error body (HTML proxy pages, gateway errors): do not echo
        // the raw bytes into the caller's output — return a compact, truncated snippet.
        const snippet = errorBody.replace(/\s+/g, " ").trim().slice(0, 200);
        throw new Error(`YooKassa HTTP ${response.status}: non-JSON error body${snippet ? ` (${snippet})` : ""}`);
      } catch (error) {
        clearTimeout(timer);
        if (error instanceof DOMException && error.name === "AbortError") {
          debugLog(`${method} ${path} -> timeout after ${Date.now() - startedAt}ms (attempt ${attempt}/${MAX_RETRIES})`);
          if (attempt < MAX_RETRIES) {
            console.error(`[yookassa-mcp] Timeout ${path}, retry (${attempt}/${MAX_RETRIES})`);
            continue;
          }
          throw new Error(`YooKassa: request timeout (${TIMEOUT / 1000}s). Try again later.`);
        }
        throw error;
      }
    }

    throw new Error("YooKassa: all retries exhausted");
  }
}

/**
 * Money input for a tool schema: a 2-decimal string ("100", "99.50") — exact, the
 * recommended form — or a positive number (converted via integer kopecks, which avoids
 * most float artifacts but cannot represent every decimal exactly).
 */
export const moneyAmount = z.union([
  z.string().regex(/^\d+(\.\d{1,2})?$/, "Amount as '100' or '100.50' (up to 2 decimals)"),
  z.number().positive(),
]);

/** ISO-4217 currency code (uppercase, 3 letters), default RUB. Rejects typos like 'rub'/'руб'. */
export const currencyCode = z.string().regex(/^[A-Z]{3}$/, "Currency as an uppercase ISO-4217 code (e.g. RUB, USD)").default("RUB");

/** Amount as integer kopecks, without lossy float arithmetic where possible. */
export function toKopecks(value: string | number): number {
  if (typeof value === "string") {
    const [whole, frac = ""] = value.split(".");
    return parseInt(whole, 10) * 100 + parseInt(((frac + "00").slice(0, 2)) || "0", 10);
  }
  return Math.round(value * 100);
}

/** Convert integer kopecks to YooKassa amount format: 10000 -> { value: "100.00" }. */
export function formatKopecks(kopecks: number, currency = "RUB"): { value: string; currency: string } {
  const whole = Math.floor(kopecks / 100);
  const frac = Math.abs(kopecks % 100);
  return { value: `${whole}.${String(frac).padStart(2, "0")}`, currency };
}

/** Convert a money value to YooKassa amount format: 100 / "100" -> "100.00". */
export function formatAmount(value: string | number, currency = "RUB"): { value: string; currency: string } {
  return formatKopecks(toKopecks(value), currency);
}
