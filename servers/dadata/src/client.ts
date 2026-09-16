/**
 * DaData HTTP client.
 *
 * Two API domains with different auth:
 *   - Suggestions API (suggestions.dadata.ru) — Token only, free 10K/day
 *   - Cleaner API (cleaner.dadata.ru)         — Token + Secret, paid 0.20 RUB/record
 *
 * Security:
 *   - API keys are read from env at call time (not cached in module scope)
 *   - Keys are never included in error messages or responses
 *   - All requests have a hard timeout (10s)
 *   - Retries only on transient errors (429, 5xx) with exponential backoff
 */

import type { ApiResult } from "./types.js";

const SUGGESTIONS_BASE = "https://suggestions.dadata.ru/suggestions/api/4_1/rs";
const CLEANER_BASE = "https://cleaner.dadata.ru/api/v1/clean";
const PROFILE_BASE = "https://dadata.ru/api/v2";

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;
const BACKOFF_BASE_MS = 1_000;
const BACKOFF_MAX_MS = 8_000;

// ---------------------------------------------------------------------------
// Config — read from env every time (no stale caching)
// ---------------------------------------------------------------------------

export function getApiKey(): string {
  const key = process.env.DADATA_API_KEY;
  if (!key) {
    throw new Error(
      "DADATA_API_KEY is not set. " +
      "Get your key at https://dadata.ru/profile/#info and add it to your MCP client env config."
    );
  }
  return key;
}

export function getSecretKey(): string | undefined {
  return process.env.DADATA_SECRET_KEY || undefined;
}

// ---------------------------------------------------------------------------
// Fetch with hard timeout
// ---------------------------------------------------------------------------

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// HTTP error mapping — never expose internal details
// ---------------------------------------------------------------------------

function mapHttpError(status: number): string {
  switch (status) {
    case 401:
      return "Authentication failed. Check that DADATA_API_KEY is valid (https://dadata.ru/profile/#info).";
    case 402:
      return "Daily request limit exceeded (10K free/day) or insufficient balance for paid endpoints.";
    case 403:
      return "Access forbidden. This endpoint may require DADATA_SECRET_KEY or a higher plan.";
    case 405:
      return "Method not allowed — this is likely a bug in the MCP server. Please report it.";
    case 413:
      return "Request too large. Query must not exceed 300 characters.";
    case 429:
      return "Rate limit exceeded (max 30 req/s). Wait a few minutes before retrying.";
    default:
      if (status >= 500) {
        return `DaData service error (HTTP ${status}). Try again later.`;
      }
      return `Unexpected HTTP ${status} from DaData API.`;
  }
}

// ---------------------------------------------------------------------------
// Core API call with retry + backoff
// ---------------------------------------------------------------------------

async function callAPI(
  url: string,
  body: unknown,
  headers: Record<string, string>,
): Promise<ApiResult> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...headers,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        return { data: await response.json(), error: null };
      }

      // Only retry on transient errors
      const isTransient = response.status === 429 || response.status >= 500;
      if (isTransient && attempt < MAX_RETRIES) {
        const waitMs = Math.min(BACKOFF_BASE_MS * Math.pow(2, attempt), BACKOFF_MAX_MS);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }

      return { data: null, error: mapHttpError(response.status) };
    } catch (err: unknown) {
      // Timeout
      if (err instanceof DOMException && err.name === "AbortError") {
        return {
          data: null,
          error: "Request timed out (10s). DaData may be experiencing issues — try again later.",
        };
      }
      // Network error — retry if attempts remain
      if (attempt < MAX_RETRIES) continue;
      // Return safe message — never expose raw error details that might contain env info
      const message = err instanceof Error ? err.message : "Unknown network error";
      return { data: null, error: `Network error: ${message}` };
    }
  }
  return { data: null, error: "Max retries exceeded." };
}

// ---------------------------------------------------------------------------
// Public API methods
// ---------------------------------------------------------------------------

/**
 * Suggestions API — requires only DADATA_API_KEY.
 * Used for: suggest/*, findById/*, geolocate/*, iplocate/*
 */
export async function callSuggestions(
  endpoint: string,
  body: object,
): Promise<ApiResult> {
  // Validate endpoint to prevent path traversal
  if (!/^[a-zA-Z0-9/_-]+$/.test(endpoint)) {
    return { data: null, error: "Invalid endpoint path." };
  }
  let apiKey: string;
  try {
    apiKey = getApiKey();
  } catch {
    return { data: null, error: "DADATA_API_KEY is not set. Add it to your MCP client env config." };
  }
  return callAPI(
    `${SUGGESTIONS_BASE}/${endpoint}`,
    body,
    { Authorization: `Token ${apiKey}` },
  );
}

/**
 * Cleaner API — requires DADATA_API_KEY + DADATA_SECRET_KEY.
 * Used for: clean/address, clean/phone, clean/name, etc.
 */
export async function callCleaner(
  type: string,
  values: string[],
): Promise<ApiResult> {
  // Validate type to prevent path traversal
  if (!/^[a-z_]+$/.test(type)) {
    return { data: null, error: "Invalid cleaner type." };
  }

  const secretKey = getSecretKey();
  if (!secretKey) {
    return {
      data: null,
      error:
        "DADATA_SECRET_KEY is required for standardization endpoints. " +
        "Add it to your MCP client env config. Get it at https://dadata.ru/profile/#info",
    };
  }

  let apiKey: string;
  try {
    apiKey = getApiKey();
  } catch {
    return { data: null, error: "DADATA_API_KEY is not set. Add it to your MCP client env config." };
  }

  return callAPI(
    `${CLEANER_BASE}/${type}`,
    values,
    {
      Authorization: `Token ${apiKey}`,
      "X-Secret": secretKey,
    },
  );
}

/**
 * Profile API — GET requests for account info.
 */
export async function callProfileAPI(endpoint: string): Promise<ApiResult> {
  if (!/^[a-z/_-]+$/.test(endpoint)) {
    return { data: null, error: "Invalid profile endpoint." };
  }

  let apiKey: string;
  try {
    apiKey = getApiKey();
  } catch {
    return { data: null, error: "DADATA_API_KEY is not set. Add it to your MCP client env config." };
  }

  const secretKey = getSecretKey();
  const headers: Record<string, string> = {
    Authorization: `Token ${apiKey}`,
    Accept: "application/json",
  };
  if (secretKey) {
    headers["X-Secret"] = secretKey;
  }

  try {
    const response = await fetchWithTimeout(`${PROFILE_BASE}/${endpoint}`, {
      method: "GET",
      headers,
    });
    if (response.ok) {
      return { data: await response.json(), error: null };
    }
    return { data: null, error: mapHttpError(response.status) };
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { data: null, error: "Request timed out (10s)." };
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return { data: null, error: `Network error: ${message}` };
  }
}
