/**
 * TGStat HTTP client.
 *
 * API: https://api.tgstat.ru
 *
 * Security:
 *   - Token is read from env (TGSTAT_TOKEN) at call time.
 *   - Token is NEVER written to logs or error messages — only the endpoint
 *     *path* is logged, never the full URL (which carries ?token=...).
 *   - Hard timeout (15s) on every request.
 *   - Retries on transient failures (HTTP 429 + 5xx, timeouts, network errors)
 *     with exponential backoff, honouring the Retry-After header when present.
 *   - The TGStat envelope (status:"ok"/"error") is unwrapped here, so a logical
 *     error returned with HTTP 200 becomes a real {@link ApiResult} error instead
 *     of being silently surfaced as success.
 *
 * ponytail: own fetch loop instead of mcp-core BaseHttpClient — the core client
 * ignores Retry-After, retries only 3 socket codes, and throws on HTTP errors,
 * while TGStat needs Retry-After, envelope unwrapping and a never-throw ApiResult.
 */

import { createLogger } from "@theyahia/mcp-core";
import type { ApiResult, TgstatEnvelope } from "./types.js";

const logger = createLogger("tgstat-mcp");

const BASE_URL = "https://api.tgstat.ru";
const TIMEOUT_MS = 15_000;
const MAX_RETRIES = 3;
const BACKOFF_BASE_MS = 1_000;
const BACKOFF_MAX_MS = 8_000;

function getToken(): string {
  const token = process.env.TGSTAT_TOKEN;
  if (!token) {
    throw new Error(
      "TGSTAT_TOKEN is not set. Get your token at https://api.tgstat.ru/ " +
        "and add it to your MCP client env configuration.",
    );
  }
  return token;
}

/** Map an HTTP status to a friendly, token-free message. */
function mapHttpError(status: number): string {
  switch (status) {
    case 400:
      return "Bad request — check the parameters.";
    case 401:
    case 403:
      return "Authentication failed — check your TGSTAT_TOKEN.";
    case 404:
      return "Not found.";
    case 429:
      return "TGStat rate limit exceeded — try again later.";
    default:
      if (status >= 500) return `TGStat service error (HTTP ${status}) — try again later.`;
      return `Unexpected HTTP ${status} from TGStat API.`;
  }
}

/** Parse a Retry-After header (seconds or HTTP-date) into ms, capped. */
function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.min(seconds * 1000, BACKOFF_MAX_MS);
  const when = Date.parse(header);
  if (!Number.isNaN(when)) return Math.min(Math.max(0, when - Date.now()), BACKOFF_MAX_MS);
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoff(attempt: number): number {
  return Math.min(BACKOFF_BASE_MS * 2 ** attempt, BACKOFF_MAX_MS);
}

/**
 * Perform a GET with retries and envelope unwrapping.
 * `path` is used only for logging; the token-bearing URL is never logged.
 */
async function callGET(path: string, search: URLSearchParams): Promise<ApiResult> {
  const url = `${BASE_URL}${path}?${search.toString()}`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      if (response.ok) {
        const json = (await response.json()) as TgstatEnvelope;
        if (json && json.status === "ok") {
          // Always hand back the payload, never the envelope itself.
          return { data: json.response ?? null, error: null };
        }
        // HTTP 200 but the envelope reports a logical error.
        return { data: null, error: `TGStat API error: ${json?.error ?? "unknown error"}` };
      }

      const transient = response.status === 429 || response.status >= 500;
      if (transient && attempt < MAX_RETRIES) {
        const wait = parseRetryAfter(response.headers.get("retry-after")) ?? backoff(attempt);
        logger.warn("Retryable HTTP error, backing off", {
          status: response.status,
          path,
          wait,
          attempt: attempt + 1,
          maxRetries: MAX_RETRIES,
        });
        await sleep(wait);
        continue;
      }
      return { data: null, error: mapHttpError(response.status) };
    } catch (err) {
      const isAbort = err instanceof Error && err.name === "AbortError";
      if (attempt < MAX_RETRIES) {
        const wait = backoff(attempt);
        logger.warn(isAbort ? "Request timeout, retrying" : "Network error, retrying", {
          path,
          wait,
          attempt: attempt + 1,
          maxRetries: MAX_RETRIES,
        });
        await sleep(wait);
        continue;
      }
      return {
        data: null,
        error: isAbort
          ? `Request to ${path} timed out after ${TIMEOUT_MS}ms.`
          : `Network error on ${path}.`,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  return { data: null, error: `Request to ${path} failed after ${MAX_RETRIES} retries.` };
}

/** Accepted primitive types for query parameters. */
export type Param = string | number | boolean | undefined;

/**
 * GET a TGStat endpoint. Adds the token, drops empty params, and returns an
 * {@link ApiResult}. Never throws — a missing token is returned as an error.
 */
export async function apiGet(path: string, params: Record<string, Param> = {}): Promise<ApiResult> {
  let token: string;
  try {
    token = getToken();
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }

  const search = new URLSearchParams();
  search.set("token", token);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }

  return callGET(path, search);
}
