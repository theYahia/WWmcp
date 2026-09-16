/**
 * ATI.su HTTP client.
 *
 * The real API (https://api.ati.su) multiplexes version/gateway prefixes on one
 * origin, so callers pass a FULL path (e.g. "/v2/cargos", "/v1.0/firms/{id}/summary",
 * "/gw/gis-rm/v1/distance") and this module only attaches the origin + auth.
 *
 * Robustness:
 *   - Exponential backoff WITH jitter on both transient-HTTP (429/5xx) and thrown
 *     network errors; honors Retry-After on 429.
 *   - Guarded JSON.parse: a non-JSON 2xx body is a non-retryable contract error,
 *     never retried as if it were a network blip.
 *   - 401 in OAuth2 mode triggers one forced token refresh + retry.
 *   - Hard timeout (15s) per attempt.
 *   - `retry: false` (non-idempotent writes): no automatic repeat after 5xx /
 *     timeout / network error — the write may already have landed.
 *
 * Why not BaseHttpClient/OAuthStrategy from @theyahia/mcp-core: the core OAuth
 * strategy only does client_credentials (ATI needs grant_type=refresh_token), and
 * this client adds refresh-on-401, Retry-After, a never-throw { data, error }
 * envelope and the ATI error-envelope logging the tools rely on.
 *
 * Security:
 *   - Bearer token only ever goes in the Authorization header — never in the URL,
 *     never logged, never in a model-visible error string.
 *   - The ATI error envelope ({ Error, Reason, ErrorsList }) is logged to stderr
 *     (core logger) for debugging; the model sees a curated, fixed message.
 */

import { createLogger } from "@theyahia/mcp-core";
import { config } from "./config.js";
import { getAccessToken, canRefresh, AUTH_HELP } from "./auth.js";
import type { ApiResult } from "./types.js";

const logger = createLogger("ati-su-mcp");

const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;
const BACKOFF_BASE_MS = 1_000;
const BACKOFF_MAX_MS = 8_000;

const WRITE_NOT_RETRIED =
  " The request changes data and was not repeated automatically — check whether it was " +
  "applied (e.g. the load was published) before retrying.";

export interface RequestOptions {
  method?: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  host?: "api" | "id";
  timeoutMs?: number;
  /** false for non-idempotent writes: 429 and 401-refresh are still retried, 5xx/timeout/network are not. */
  retry?: boolean;
}

function buildUrl(path: string, host: "api" | "id", query?: RequestOptions["query"]): string {
  const origin = host === "id" ? config.idHost : config.apiHost;
  const url = new URL(path.startsWith("/") ? path : `/${path}`, origin);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function backoff(attempt: number, retryAfterMs?: number): Promise<void> {
  const base = retryAfterMs ?? Math.min(BACKOFF_BASE_MS * 2 ** attempt, BACKOFF_MAX_MS);
  const jittered = base * (0.5 + Math.random() * 0.5);
  await new Promise((r) => setTimeout(r, jittered));
}

function parseRetryAfterMs(res: Response): number | undefined {
  const h = res.headers.get("retry-after");
  if (!h) return undefined;
  const secs = Number(h);
  return Number.isFinite(secs) ? secs * 1000 : undefined;
}

function mapHttpError(status: number): string {
  switch (status) {
    case 400:
      return "Bad request. Check parameters.";
    case 401:
      return "Authentication failed. Check your ATI.su credentials.";
    case 403:
      return "Access forbidden. Check your token's permissions/scopes.";
    case 404:
      return "Resource not found.";
    case 409:
      return "Conflict — the resource already exists or violates a constraint.";
    case 429:
      return "Rate limit exceeded. Wait before retrying.";
    default:
      if (status >= 500) return `ATI.su service error (HTTP ${status}). Try again later.`;
      return `Unexpected HTTP ${status} from ATI.su API.`;
  }
}

/** Reads the error body, logs the ATI error envelope to stderr, returns a curated result. */
async function finalizeHttpError(res: Response, logPath: string): Promise<ApiResult> {
  try {
    const text = await res.text();
    if (text) {
      let detail: string;
      try {
        const env = JSON.parse(text) as {
          Error?: string;
          Reason?: string;
          ErrorsList?: unknown[];
        };
        detail = JSON.stringify({
          Error: env.Error,
          Reason: env.Reason,
          ErrorsList: env.ErrorsList,
        });
      } catch {
        detail = text.slice(0, 500); // non-JSON error body — log raw, truncated
      }
      logger.error("ATI.su HTTP error", { status: res.status, path: logPath, detail });
    }
  } catch {
    /* ignore body read failures */
  }
  return { data: null, error: mapHttpError(res.status) };
}

/**
 * Performs an authenticated request against the ATI.su API.
 * Returns a normalized { data, error } envelope — never throws.
 */
export async function request<T = unknown>(
  path: string,
  opts: RequestOptions = {},
): Promise<ApiResult<T>> {
  const {
    method = "GET",
    query,
    body,
    host = "api",
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retry = true,
  } = opts;
  const notRetried = retry ? "" : WRITE_NOT_RETRIED;
  const url = buildUrl(path, host, query);
  const logPath = `${method} ${new URL(url).pathname}`;
  let didRefresh = false;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    let token: string;
    try {
      token = await getAccessToken();
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : `No credentials. ${AUTH_HELP}`,
      };
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };
    if (body !== undefined) headers["Content-Type"] = "application/json";

    try {
      const res = await fetchWithTimeout(
        url,
        { method, headers, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) },
        timeoutMs,
      );

      if (res.ok) {
        const text = await res.text();
        if (!text) return { data: {} as T, error: null };
        try {
          return { data: JSON.parse(text) as T, error: null };
        } catch {
          return { data: null, error: "ATI.su returned a non-JSON response." };
        }
      }

      // OAuth2: a 401 likely means the access token expired mid-flight — refresh once.
      if (res.status === 401 && canRefresh() && !didRefresh) {
        didRefresh = true;
        try {
          await getAccessToken(true);
        } catch (err) {
          return {
            data: null,
            error: err instanceof Error ? err.message : "Token refresh failed.",
          };
        }
        continue;
      }

      const isTransient = res.status === 429 || (retry && res.status >= 500);
      if (isTransient && attempt < MAX_RETRIES) {
        await backoff(attempt, parseRetryAfterMs(res));
        continue;
      }

      const failed = (await finalizeHttpError(res, logPath)) as ApiResult<T>;
      if (res.status >= 500) failed.error = `${failed.error}${notRetried}`;
      return failed;
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        if (retry && attempt < MAX_RETRIES) {
          await backoff(attempt);
          continue;
        }
        return {
          data: null,
          error: `Request timed out (15s). ATI.su may be experiencing issues.${notRetried}`,
        };
      }
      // Network-level failure (DNS/ECONNRESET/TLS). Log detail to stderr (stdout is
      // reserved for JSON-RPC); return a generic message and retry with backoff.
      const message = err instanceof Error ? err.message : "Unknown network error";
      logger.error("ATI.su network error", { path: logPath, error: message });
      if (retry && attempt < MAX_RETRIES) {
        await backoff(attempt);
        continue;
      }
      return {
        data: null,
        error: `Network error contacting ATI.su. Check connectivity and try again.${notRetried}`,
      };
    }
  }

  return { data: null, error: "Max retries exceeded." };
}
