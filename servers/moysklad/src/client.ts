import { PKG_NAME, VERSION } from "./version.js";

const BASE_URL = "https://api.moysklad.ru/api/remap/1.2";
const TIMEOUT = 15_000;
const MAX_RETRIES = 3;
const MAX_BACKOFF_MS = 30_000;

const USER_AGENT = `${PKG_NAME}/${VERSION}`;

// --- Rate limiting -----------------------------------------------------------
//
// MoySklad uses a "request weight per 3-second window" model. The window size
// (45 for a public-solution token) shrinks for login/password and user tokens
// (≈22 now, dropping toward ≈11 by the end of 2026) and some reports cost more
// than one unit (stock/all and stock/bystore cost 5). Because we can't tell
// which auth tier the configured token belongs to, the default bucket is kept
// deliberately conservative to avoid the API auto-disabling access on repeated
// 429s (which can only be restored via MoySklad support). Solution-token users
// can raise it via MOYSKLAD_RATE_BUCKET.

const REFILL_MS = 3000;

function envInt(name: string, fallback: number): number {
  const v = parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

const BUCKET_MAX = envInt("MOYSKLAD_RATE_BUCKET", 20);
const MAX_CONCURRENT = envInt("MOYSKLAD_MAX_CONCURRENT", 5); // MoySklad allows 5 parallel/user

let tokens = BUCKET_MAX;
let windowStart = Date.now();

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Acquire `weight` units from the fixed-window bucket, waiting for the next
 * window if needed. The check-and-decrement runs synchronously (no await
 * between them), so concurrent callers can't double-spend.
 */
async function acquireToken(weight = 1): Promise<void> {
  const cost = Math.min(Math.max(1, weight), BUCKET_MAX);
  for (;;) {
    const now = Date.now();
    if (now - windowStart >= REFILL_MS) {
      tokens = BUCKET_MAX;
      windowStart = now;
    }
    if (tokens >= cost) {
      tokens -= cost;
      return;
    }
    const wait = REFILL_MS - (now - windowStart);
    await sleep(wait > 0 ? wait : REFILL_MS);
  }
}

// --- Concurrency cap (MoySklad: max 5 parallel requests per user) ------------

let active = 0;
const waiters: Array<() => void> = [];

async function acquireSlot(): Promise<void> {
  if (active < MAX_CONCURRENT) {
    active++;
    return;
  }
  // Wait to be handed the slot by releaseSlot (which keeps `active` unchanged).
  await new Promise<void>((resolve) => waiters.push(resolve));
}

function releaseSlot(): void {
  const next = waiters.shift();
  if (next) next();
  else active--;
}

// --- Auth --------------------------------------------------------------------

function getAuthHeader(): string {
  const token = process.env.MOYSKLAD_TOKEN;
  if (token) return `Bearer ${token}`;

  const login = process.env.MOYSKLAD_LOGIN;
  const password = process.env.MOYSKLAD_PASSWORD;
  if (login && password) {
    const encoded = Buffer.from(`${login}:${password}`).toString("base64");
    return `Basic ${encoded}`;
  }

  throw new Error("Auth not configured. Set MOYSKLAD_TOKEN or both MOYSKLAD_LOGIN and MOYSKLAD_PASSWORD.");
}

// --- HTTP --------------------------------------------------------------------

export async function moyskladGet(path: string, weight = 1): Promise<unknown> {
  return moyskladRequest("GET", path, undefined, weight);
}

export async function moyskladPost(path: string, body: unknown, weight = 1): Promise<unknown> {
  return moyskladRequest("POST", path, body, weight);
}

export async function moyskladPut(path: string, body: unknown, weight = 1): Promise<unknown> {
  return moyskladRequest("PUT", path, body, weight);
}

export async function moyskladDelete(path: string, weight = 1): Promise<unknown> {
  return moyskladRequest("DELETE", path, undefined, weight);
}

/** Parse a MoySklad error body (`{ errors: [...] }`) into a readable message. */
function formatApiError(status: number, text: string): string {
  try {
    const parsed = JSON.parse(text) as { errors?: Array<Record<string, unknown>> };
    const errs = parsed?.errors;
    if (Array.isArray(errs) && errs.length > 0) {
      const msg = errs
        .map((e) => {
          const code = e.code ? `[${String(e.code)}] ` : "";
          const head = e.error ? String(e.error) : "";
          const detail = e.error_message ? ` — ${String(e.error_message)}` : "";
          const param = e.parameter ? ` (parameter: ${String(e.parameter)})` : "";
          return `${code}${head}${detail}${param}`.trim();
        })
        .join("; ");
      return `MoySklad HTTP ${status}: ${msg}`;
    }
  } catch {
    // body wasn't MoySklad JSON — fall through to the raw text
  }
  return `MoySklad HTTP ${status}: ${text}`;
}

/** Compute the retry delay, preferring MoySklad's own headers. */
function retryDelayMs(headers: Headers, attempt: number): number {
  const lognex = parseInt(headers.get("X-Lognex-Retry-After") ?? "", 10); // milliseconds
  if (Number.isFinite(lognex) && lognex > 0) return Math.min(lognex, MAX_BACKOFF_MS);

  const retryAfter = parseInt(headers.get("Retry-After") ?? "", 10); // seconds
  if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(retryAfter * 1000, MAX_BACKOFF_MS);

  return Math.min(1000 * 2 ** (attempt - 1), 8000);
}

async function moyskladRequest(method: string, path: string, body?: unknown, weight = 1): Promise<unknown> {
  await acquireSlot();
  try {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      await acquireToken(weight);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT);

      try {
        const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
        // NOTE: we intentionally do NOT set Accept-Encoding. Node's fetch
        // (undici) already sends `gzip` and transparently decompresses the
        // response — which satisfies MoySklad's mandatory-gzip rule. Setting
        // the header manually makes undici skip decompression and hand back raw
        // gzip bytes, breaking JSON.parse. Do not "fix" this by adding it.
        const response = await fetch(url, {
          method,
          headers: {
            Authorization: getAuthHeader(),
            "Content-Type": "application/json;charset=utf-8",
            Accept: "application/json;charset=utf-8",
            "User-Agent": USER_AGENT,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (response.ok) {
          const text = await response.text();
          return text ? JSON.parse(text) : { success: true };
        }

        if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
          const delay = retryDelayMs(response.headers, attempt);
          console.error(`[moysklad-mcp] ${response.status}, retry in ${delay}ms (${attempt}/${MAX_RETRIES})`);
          await sleep(delay);
          continue;
        }

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            `MoySklad auth error ${response.status}: check credentials are valid and have required permissions`,
          );
        }

        if (response.status === 415) {
          throw new Error(
            "MoySklad HTTP 415: the API requires gzip-encoded responses. This usually means the runtime's fetch isn't sending Accept-Encoding: gzip — check your Node version (>=18).",
          );
        }

        const text = await response.text();
        throw new Error(formatApiError(response.status, text));
      } catch (error) {
        clearTimeout(timer);
        if (error instanceof DOMException && error.name === "AbortError" && attempt < MAX_RETRIES) {
          console.error(`[moysklad-mcp] Timeout, retry (${attempt}/${MAX_RETRIES})`);
          continue;
        }
        throw error;
      }
    }
    throw new Error("MoySklad: all retries exhausted");
  } finally {
    releaseSlot();
  }
}

export {
  acquireToken as _acquireToken,
  getAuthHeader as _getAuthHeader,
  formatApiError as _formatApiError,
  retryDelayMs as _retryDelayMs,
  BASE_URL,
};
