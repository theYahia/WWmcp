import { createLogger } from "@theyahia/mcp-core";

const logger = createLogger("retailcrm-mcp");

const TIMEOUT = 15_000;
const MAX_RETRIES = 3;

// Optional client-side rate limiter (RetailCRM throttles bursts → HTTP 503).
// Disabled unless RETAILCRM_RATE_LIMIT (requests/second) is set. v5 allows 10 req/s per IP.
const RATE_LIMIT = Number(process.env.RETAILCRM_RATE_LIMIT) || 0;

function getBaseUrl(): string {
  const domain = process.env.RETAILCRM_DOMAIN || process.env.RETAILCRM_URL;
  if (!domain) throw new Error("RETAILCRM_DOMAIN is not set. Set it to your RetailCRM domain (e.g. yourstore.retailcrm.ru)");
  const base = domain.endsWith("/") ? domain.slice(0, -1) : domain;
  return `https://${base.replace(/^https?:\/\//, "")}/api/v5`;
}

function getApiKey(): string {
  const key = process.env.RETAILCRM_API_KEY;
  if (!key) throw new Error("RETAILCRM_API_KEY is not set. Create one in RetailCRM > Settings > Integration > API keys");
  return key;
}

/**
 * Typed error carrying the numeric HTTP status and a timeout flag, so the retry
 * logic can branch on structured fields instead of re-parsing message strings.
 */
export class RetailCrmHttpError extends Error {
  readonly status: number;
  readonly isTimeout: boolean;
  readonly body?: string;
  constructor(message: string, opts: { status?: number; isTimeout?: boolean; body?: string } = {}) {
    super(message);
    this.name = "RetailCrmHttpError";
    this.status = opts.status ?? 0;
    this.isTimeout = opts.isTimeout ?? false;
    this.body = opts.body;
  }
}

interface RetailCrmErrorResponse {
  success: boolean;
  errorMsg?: string;
  errors?: Record<string, string> | string[];
}

export function formatApiError(status: number, body: string): string {
  try {
    const parsed = JSON.parse(body) as RetailCrmErrorResponse;
    const parts: string[] = [`RetailCRM HTTP ${status}`];
    if (parsed.errorMsg) parts.push(parsed.errorMsg);
    if (parsed.errors) {
      if (Array.isArray(parsed.errors)) {
        parts.push(parsed.errors.join("; "));
      } else {
        parts.push(Object.entries(parsed.errors).map(([k, v]) => `${k}: ${v}`).join("; "));
      }
    }
    return parts.join(" — ");
  } catch {
    return `RetailCRM HTTP ${status}: ${body.slice(0, 500)}`;
  }
}

/**
 * Retry policy. HTTP 429 means the server rejected the request BEFORE processing,
 * so it is always safe to retry. Timeouts and 5xx are ambiguous for mutations (the
 * write may have committed), so they are retried ONLY for idempotent (GET) requests.
 */
function isRetryable(error: unknown, idempotent: boolean): boolean {
  if (!(error instanceof RetailCrmHttpError)) return false;
  if (error.status === 429) return true;
  if (!idempotent) return false;
  return error.isTimeout || (error.status >= 500 && error.status <= 599);
}

async function withRetry<T>(fn: () => Promise<T>, idempotent: boolean): Promise<T> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= MAX_RETRIES || !isRetryable(error, idempotent)) throw error;
      // Exponential backoff with jitter to avoid thundering-herd on shared throttles.
      const base = Math.min(1000 * 2 ** (attempt - 1), 8000);
      const delay = base + Math.floor(Math.random() * 250);
      logger.warn("Retryable error, backing off", { delayMs: delay, attempt, maxRetries: MAX_RETRIES });
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error("RetailCRM: all retries exhausted");
}

// ── Optional rate limiter ────────────────────────────────────
let lastCall = 0;
async function rateGate(): Promise<void> {
  if (RATE_LIMIT <= 0) return;
  const minInterval = 1000 / RATE_LIMIT;
  const now = Date.now();
  const wait = lastCall + minInterval - now;
  lastCall = Math.max(now, lastCall + minInterval);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
}

function commonHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    Accept: "application/json",
    "X-API-KEY": getApiKey(),
    "User-Agent": "retailcrm-mcp",
    ...extra,
  };
}

/**
 * One HTTP attempt. The AbortController stays armed across the response-body read,
 * so a server that sends headers then stalls the body still hits the timeout.
 */
async function doFetch(url: string, init: RequestInit, idempotent: boolean): Promise<unknown> {
  return withRetry(async () => {
    await rateGate();
    const controller = new AbortController();
    let aborted = false;
    const timer = setTimeout(() => { aborted = true; controller.abort(); }, TIMEOUT);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      if (response.ok) {
        const data = await response.json();
        clearTimeout(timer);
        return data;
      }
      const text = await response.text();
      clearTimeout(timer);
      throw new RetailCrmHttpError(formatApiError(response.status, text), { status: response.status, body: text });
    } catch (error) {
      clearTimeout(timer);
      if (aborted || (error instanceof Error && error.name === "AbortError")) {
        throw new RetailCrmHttpError(`RetailCRM request timed out after ${TIMEOUT}ms`, { isTimeout: true });
      }
      throw error;
    }
  }, idempotent);
}

export async function retailCrmGet(path: string, params?: Record<string, string>): Promise<unknown> {
  const qs = new URLSearchParams(params).toString();
  const url = qs ? `${getBaseUrl()}${path}?${qs}` : `${getBaseUrl()}${path}`;
  return doFetch(url, { headers: commonHeaders() }, true);
}

export async function retailCrmPost(path: string, formData: Record<string, string>): Promise<unknown> {
  const body = new URLSearchParams(formData).toString();
  return doFetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers: commonHeaders({ "Content-Type": "application/x-www-form-urlencoded" }),
    body,
  }, false); // mutation: do not retry on timeout/5xx (may have committed)
}

/**
 * Raw-body POST for endpoints that take the payload directly (e.g. /files/upload,
 * which expects the file bytes under Content-Type: application/octet-stream — NOT
 * multipart/form-data).
 */
export async function retailCrmPostRaw(
  path: string,
  body: Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<unknown> {
  return doFetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers: commonHeaders({ "Content-Type": contentType }),
    body: body as BodyInit,
  }, false);
}
