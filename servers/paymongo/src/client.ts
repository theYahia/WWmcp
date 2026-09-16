const BASE_URL = "https://api.paymongo.com/v1";
const TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;

/** A single error object as returned by the PayMongo API (`errors[]`). */
export interface PayMongoApiError {
  code?: string;
  detail?: string;
  source?: { pointer?: string; attribute?: string };
}

/** Error thrown when PayMongo returns a non-2xx response or a guard trips. */
export class PayMongoError extends Error {
  readonly status: number;
  readonly errors?: PayMongoApiError[];

  constructor(message: string, status: number, errors?: PayMongoApiError[]) {
    super(message);
    this.name = "PayMongoError";
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Turn a raw PayMongo error response into a readable {@link PayMongoError}.
 * Parses the `{ errors: [{ code, detail, source }] }` shape into
 * `code: detail (pointer)` segments. Falls back to the raw text for non-JSON
 * bodies. The message ALWAYS starts with `PayMongo HTTP <status>` so callers
 * (and tests) can rely on that prefix regardless of branch.
 *
 * Note: we only surface the documented `errors[]` fields — never the echoed
 * request `attributes` — to avoid leaking sensitive request data (e.g. card
 * numbers) back through error messages.
 */
export function formatPayMongoError(status: number, rawText: string): PayMongoError {
  const prefix = `PayMongo HTTP ${status}`;

  let parsed: { errors?: PayMongoApiError[] } | undefined;
  try {
    parsed = JSON.parse(rawText) as { errors?: PayMongoApiError[] };
  } catch {
    // body was not JSON — fall through to the raw-text fallback below
  }

  if (parsed?.errors && Array.isArray(parsed.errors) && parsed.errors.length > 0) {
    const details = parsed.errors
      .map((e) => {
        const code = e.code ? `${e.code}: ` : "";
        const detail = e.detail ?? "unknown error";
        const pointer = e.source?.pointer ?? e.source?.attribute;
        return pointer ? `${code}${detail} (${pointer})` : `${code}${detail}`;
      })
      .join("; ");
    return new PayMongoError(`${prefix}: ${details}`, status, parsed.errors);
  }

  const trimmed = rawText?.trim();
  return new PayMongoError(trimmed ? `${prefix}: ${trimmed}` : prefix, status);
}

export interface RequestOptions {
  /**
   * Marks this call as a money-moving operation (creates a charge, refund,
   * payment intent/source/checkout/link, or attaches real card data). When the
   * configured secret key is a LIVE key (`sk_live_`) and `PAYMONGO_ALLOW_LIVE`
   * is not `true`, the request is refused before any network call.
   */
  moneyMoving?: boolean;
}

export class PayMongoClient {
  private readonly secretKey: string;
  /** True when the configured secret key is a live key (`sk_live_`). */
  readonly isLive: boolean;
  private readonly allowLive: boolean;

  constructor() {
    this.secretKey = process.env.PAYMONGO_SECRET_KEY ?? "";
    if (!this.secretKey) {
      throw new PayMongoError(
        "Environment variable PAYMONGO_SECRET_KEY is required. " +
          "Get your key at https://dashboard.paymongo.com/",
        401,
      );
    }
    this.isLive = this.secretKey.startsWith("sk_live_");
    this.allowLive = process.env.PAYMONGO_ALLOW_LIVE === "true";
  }

  private get authHeader(): string {
    return "Basic " + Buffer.from(this.secretKey + ":").toString("base64");
  }

  private assertLiveAllowed(method: string, path: string): void {
    if (this.isLive && !this.allowLive) {
      throw new PayMongoError(
        `Refusing a money-moving operation (${method} ${path}) with a LIVE secret key (sk_live_). ` +
          "This safety guard prevents accidental real-money charges or refunds. " +
          "Set PAYMONGO_ALLOW_LIVE=true to enable live operations.",
        403,
      );
    }
  }

  async request(
    method: string,
    path: string,
    body?: unknown,
    opts: RequestOptions = {},
  ): Promise<unknown> {
    if (opts.moneyMoving) this.assertLiveAllowed(method, path);

    const isGet = method.toUpperCase() === "GET";
    let attempt = 0;

    while (true) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const response = await fetch(`${BASE_URL}${path}`, {
          method,
          headers: {
            Authorization: this.authHeader,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (!response.ok) {
          // Retry policy: 429 always; 5xx for GET only (a POST may have
          // succeeded server-side — retrying without idempotency keys risks a
          // double charge).
          const retryable =
            response.status === 429 || (isGet && response.status >= 500);
          if (retryable && attempt < MAX_RETRIES) {
            const delay =
              parseRetryAfter(response.headers.get("retry-after")) ??
              backoffDelay(attempt);
            attempt++;
            await sleep(delay);
            continue;
          }
          const text = await response.text();
          throw formatPayMongoError(response.status, text);
        }

        // Decode the success body. A decode failure is NOT transient — wrap it
        // as a PayMongoError so it isn't caught by the network-retry branch.
        try {
          return await response.json();
        } catch {
          throw new PayMongoError(
            `PayMongo HTTP ${response.status}: response body was not valid JSON.`,
            response.status,
          );
        }
      } catch (error) {
        clearTimeout(timer);
        if (error instanceof PayMongoError) throw error;

        const isAbort =
          error instanceof DOMException && error.name === "AbortError";
        // Transient network/timeout errors: retry GET only. Compute the delay
        // before incrementing so both retry paths follow the same backoff curve.
        if (isGet && attempt < MAX_RETRIES) {
          const delay = backoffDelay(attempt);
          attempt++;
          await sleep(delay);
          continue;
        }
        if (isAbort) {
          throw new PayMongoError(
            `PayMongo HTTP 408: request timeout (${TIMEOUT_MS / 1000}s).`,
            408,
          );
        }
        // Keep the documented "PayMongo HTTP <status>" prefix even for
        // transport-layer failures (status 0 = no HTTP response received).
        const message = error instanceof Error ? error.message : String(error);
        throw new PayMongoError(`PayMongo HTTP 0: network error — ${message}`, 0);
      }
    }
  }
}

/** Exponential backoff with a 4s cap: ~1s, 2s, (capped) 4s. */
function backoffDelay(attempt: number): number {
  return Math.min(1000 * 2 ** attempt, 4000);
}

/** Parse a `Retry-After` header (delta-seconds or HTTP-date), clamped to 0–10s. */
function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined;
  const asSeconds = Number(header);
  if (!Number.isNaN(asSeconds)) {
    return Math.min(Math.max(asSeconds, 0), 10) * 1000;
  }
  const asDate = Date.parse(header);
  if (!Number.isNaN(asDate)) {
    return Math.min(Math.max(asDate - Date.now(), 0), 10_000);
  }
  return undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Lazy singleton -------------------------------------------------------
// The client is constructed on first use (NOT at import time) so the server
// can list its tools without a key set; a missing key then surfaces as a
// tool-call error rather than crashing the process during `tools/list`.
let cached: PayMongoClient | null = null;

export function getClient(): PayMongoClient {
  if (!cached) cached = new PayMongoClient();
  return cached;
}

/** Test-only: drop the cached client so a new key/env is picked up. */
export function __resetClientForTests(): void {
  cached = null;
}
