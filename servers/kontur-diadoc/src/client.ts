import { getApiClientId, getBaseUrl, getCredentials } from "./config.js";

const TIMEOUT_MS = 15_000;
const MAX_RETRIES = 3;
/** Diadoc tokens are valid for ~24h; refresh a little early to be safe. */
const TOKEN_TTL_MS = 23 * 60 * 60 * 1000;

interface CachedToken {
  value: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;

/** Error carrying the HTTP status and any response body Diadoc returned, for friendlier messages. */
export class DiadocError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly detail = "",
  ) {
    const suffix = detail ? `: ${truncate(detail, 500)}` : "";
    super(`Diadoc HTTP ${status} ${statusText}${suffix}`);
    this.name = "DiadocError";
  }
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function backoffDelay(attempt: number): number {
  return Math.min(1000 * 2 ** (attempt - 1), 8000);
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Authenticate against Diadoc with login/password and cache the token.
 *
 * Correct request shape (per developer.kontur.ru/doc/diadoc-api):
 *   POST /V3/Authenticate?type=password
 *   Authorization: DiadocAuth ddauth_api_client_id=<developer key>
 *   body: { "login": "...", "password": "..." }
 * The token is returned in the response body and is reused until it expires or a 401 occurs.
 */
export async function authenticate(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const { apiClientId, login, password } = getCredentials();

  const response = await fetch(`${getBaseUrl()}/V3/Authenticate?type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `DiadocAuth ddauth_api_client_id=${apiClientId}`,
    },
    body: JSON.stringify({ login, password }),
    // Без таймаута зависший эндпоинт аутентификации вешает любой вызов инструмента.
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new DiadocError(response.status, response.statusText || "authentication failed", detail);
  }

  const token = (await response.text()).trim();
  if (!token) {
    throw new Error("Diadoc authentication returned an empty token.");
  }

  cachedToken = { value: token, expiresAt: Date.now() + TOKEN_TTL_MS };
  return token;
}

export function clearToken(): void {
  cachedToken = null;
}

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `DiadocAuth ddauth_api_client_id=${getApiClientId()},ddauth_token=${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function parseBody(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

interface RequestOptions {
  params?: Record<string, string>;
  body?: unknown;
}

/**
 * Perform an authenticated Diadoc request with timeout, exponential backoff on
 * 429/5xx, and a single transparent re-authentication on 401.
 */
async function diadocRequest(
  method: "GET" | "POST",
  path: string,
  { params = {}, body }: RequestOptions = {},
): Promise<unknown> {
  let token = await authenticate();
  let reauthenticated = false;

  const query = new URLSearchParams(params);
  const url = `${getBaseUrl()}${path}${query.toString() ? `?${query.toString()}` : ""}`;
  // Повторяем только GET, как в BaseHttpClient ядра: 5xx или таймаут на PostMessage
  // не значит, что Диадок документ не принял, — повтор отправит его контрагенту дважды.
  const idempotent = method === "GET";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method,
        headers: authHeaders(token),
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.ok) {
        return parseBody(await response.text());
      }

      // Token expired/invalid: drop it, re-authenticate once, and retry the request.
      if (response.status === 401 && !reauthenticated) {
        clearToken();
        token = await authenticate();
        reauthenticated = true;
        continue;
      }

      if (
        (response.status === 429 || response.status >= 500) &&
        idempotent &&
        attempt < MAX_RETRIES
      ) {
        await sleep(backoffDelay(attempt));
        continue;
      }

      const detail = await response.text().catch(() => "");
      throw new DiadocError(response.status, response.statusText, detail);
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof DiadocError) throw error;
      if (isAbortError(error) && idempotent && attempt < MAX_RETRIES) continue;
      throw error;
    }
  }

  throw new Error(`Diadoc: all ${MAX_RETRIES} retry attempts exhausted for ${method} ${path}`);
}

export function diadocGet(path: string, params: Record<string, string> = {}): Promise<unknown> {
  return diadocRequest("GET", path, { params });
}

export function diadocPost(
  path: string,
  body: unknown,
  params: Record<string, string> = {},
): Promise<unknown> {
  return diadocRequest("POST", path, { params, body });
}
