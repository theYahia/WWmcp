/**
 * Planfix API client — built on @theyahia/mcp-core's BaseHttpClient.
 *
 * Core handles transport concerns (timeout, HTTP retry/backoff, ApiError).
 * What stays here is Planfix-specific and NOT covered by core:
 *   1. Per-account base URL (`https://<account>.planfix.com/rest`).
 *   2. The `{result:"fail"}` envelope Planfix returns at HTTP 200 — including
 *      logical rate-limit code 22, which is retryable while other codes are not.
 *
 * The exported planfixRequest/planfixGet/planfixPost API is unchanged, so
 * tools/* keep their signatures.
 */

import {
  BaseHttpClient,
  createLogger,
  type AuthStrategy,
} from "@theyahia/mcp-core";

const logger = createLogger("planfix-mcp");

/** Logical rate-limit code in Planfix `{result:"fail"}` envelopes (retryable). */
const RATE_LIMIT_CODE = 22;
// ponytail: envelope retries nest inside core's HTTP retries — a flaky 5xx plus
// code-22 throttling can cost up to 9 fetches. Flatten only if that shows up in logs.
const MAX_ENVELOPE_RETRIES = 3;

function getBaseUrl(): string {
  const account = process.env.PLANFIX_ACCOUNT;
  if (!account) {
    throw new Error(
      "Не задан PLANFIX_ACCOUNT — субдомен аккаунта (например `mycompany` из mycompany.planfix.com). " +
      "Субдомен обязателен: Planfix REST API не имеет общего хоста, точка входа — https://<account>.planfix.com/rest/.",
    );
  }
  // Allow a custom host suffix for regional installs (e.g. PLANFIX_HOST=planfix.ru).
  const host = process.env.PLANFIX_HOST || "planfix.com";
  return `https://${account}.${host}/rest`;
}

/** Bearer auth: PLANFIX_API_KEY, falling back to the legacy PLANFIX_TOKEN. */
class PlanfixAuthStrategy implements AuthStrategy {
  readonly type = "planfix_api_key";

  async authenticate(req: RequestInit): Promise<RequestInit> {
    const key = process.env.PLANFIX_API_KEY || process.env.PLANFIX_TOKEN;
    if (!key) {
      throw new Error(
        "Не задан ключ авторизации. Установите PLANFIX_API_KEY (или устаревший PLANFIX_TOKEN). " +
        "Ключ создаётся в Управлении аккаунтом → Доступ к API → REST API.",
      );
    }
    const headers = new Headers(req.headers);
    headers.set("Authorization", `Bearer ${key}`);
    return { ...req, headers };
  }
}

// Lazily built so a missing PLANFIX_ACCOUNT surfaces on the first request
// (with a useful message) rather than at import time.
let _client: BaseHttpClient | null = null;

function getClient(): BaseHttpClient {
  if (!_client) {
    _client = new BaseHttpClient({
      baseUrl: getBaseUrl(),
      timeout: 15_000,
      maxRetries: 3,
      auth: new PlanfixAuthStrategy(),
      logger,
    });
  }
  return _client;
}

/** Drops the memoized client — for tests that change PLANFIX_* env vars. */
export function resetClient(): void {
  _client = null;
}

function isFailEnvelope(
  parsed: unknown,
): parsed is { result: "fail"; code?: number; error?: string } {
  return (
    typeof parsed === "object" &&
    parsed !== null &&
    (parsed as Record<string, unknown>).result === "fail"
  );
}

export async function planfixRequest(
  method: "GET" | "POST",
  endpoint: string,
  body?: Record<string, unknown>,
  params?: Record<string, string>,
): Promise<unknown> {
  // Preserve a meaningful trailing slash (Planfix documents `POST /task/` and
  // `.../comments/`); only normalize the leading slash for the baseUrl join.
  const path = `/${endpoint.replace(/^\/+/, "")}`;

  for (let attempt = 1; attempt <= MAX_ENVELOPE_RETRIES; attempt++) {
    // Core retries HTTP-level failures (429/5xx/timeout) internally.
    const parsed =
      (await getClient().request({
        method,
        path,
        ...(params ? { params } : {}),
        ...(body && method === "POST" ? { body } : {}),
      })) ?? {};

    // Planfix returns HTTP 2xx even for some logical failures — inspect the
    // `result` field so a `{result:"fail"}` body is never mistaken for success.
    if (!isFailEnvelope(parsed)) return parsed;

    const code = parsed.code;
    const errMsg = parsed.error ?? "неизвестная ошибка";
    if (code === RATE_LIMIT_CODE && attempt < MAX_ENVELOPE_RETRIES) {
      const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
      logger.warn("Planfix rate limit (code 22), backing off", {
        delay,
        attempt,
        path,
      });
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }
    throw new Error(`Planfix API error ${code ?? "?"}: ${errMsg}`);
  }
  throw new Error("Planfix API: все попытки исчерпаны");
}

/** POST shorthand. */
export async function planfixPost(
  endpoint: string,
  body: Record<string, unknown> = {},
): Promise<unknown> {
  return planfixRequest("POST", endpoint, body);
}

/** GET shorthand with optional query parameters (e.g. `{ fields: "id,name" }`). */
export async function planfixGet(
  endpoint: string,
  query?: Record<string, string | number | undefined>,
): Promise<unknown> {
  let params: Record<string, string> | undefined;
  if (query) {
    const entries = Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)] as const);
    if (entries.length) params = Object.fromEntries(entries);
  }
  return planfixRequest("GET", endpoint, undefined, params);
}
