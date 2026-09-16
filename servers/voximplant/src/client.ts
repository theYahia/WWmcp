import { getCredentials, logger } from "./config.js";
import { parseVoxError } from "./errors.js";

const BASE_URL = "https://api.voximplant.com/platform_api";
const TIMEOUT_MS = 15_000;
const MAX_RETRIES = 3;
const MAX_BACKOFF_MS = 8000;

/** Результат вызова API как значение (клиент не бросает наружу). */
export type ApiResult<T = unknown> =
  | { data: T; error: null }
  | { data: null; error: string };

type HttpMethod = "GET" | "POST";

function buildParams(params: Record<string, string>, accountId: string, apiKey: string): URLSearchParams {
  return new URLSearchParams({ ...params, account_id: accountId, api_key: apiKey });
}

function backoff(attempt: number): number {
  return Math.min(1000 * 2 ** (attempt - 1), MAX_BACKOFF_MS);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function safeBody(response: Response): Promise<unknown> {
  try {
    const text = await response.text();
    try { return JSON.parse(text); } catch { return text; }
  } catch {
    return null;
  }
}

/**
 * Единая точка вызова Platform API.
 * GET — для чтения (ключ в query). POST — для записи и крупных payload
 * (скрипт сценария, длинный SMS): тело form-urlencoded, чтобы не упереться в лимит URL.
 * Секрет / URL с ключом в логи НЕ попадают — логируется только имя метода.
 */
async function call(httpMethod: HttpMethod, method: string, params: Record<string, string>): Promise<ApiResult> {
  const creds = getCredentials();
  if (!creds) {
    return { data: null, error: "VOXIMPLANT_ACCOUNT_ID и VOXIMPLANT_API_KEY не заданы" };
  }

  let lastError = "Voximplant API: все попытки исчерпаны";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const form = buildParams(params, creds.accountId, creds.apiKey);
      const url = httpMethod === "GET" ? `${BASE_URL}/${method}?${form.toString()}` : `${BASE_URL}/${method}`;
      const init: RequestInit = { method: httpMethod, signal: controller.signal };
      if (httpMethod === "POST") {
        init.body = form;
        init.headers = { "Content-Type": "application/x-www-form-urlencoded" };
      }

      const response = await fetch(url, init);
      clearTimeout(timer);

      if (response.ok) {
        const data = (await response.json()) as Record<string, unknown>;
        if (data && data.error) {
          // Ошибка уровня API (HTTP 200 + error в теле) — не ретраим.
          return { data: null, error: parseVoxError(data, response.status).message };
        }
        return { data, error: null };
      }

      // Ретраим 429 (любой метод) и 5xx (только идемпотентный GET).
      const retryable = response.status === 429 || (response.status >= 500 && httpMethod === "GET");
      if (retryable && attempt < MAX_RETRIES) {
        const retryAfter = Number(response.headers.get("retry-after"));
        // Уважаем Retry-After, но не даём серверу заблокировать нас надолго (cap = MAX_BACKOFF_MS).
        const delay = Number.isFinite(retryAfter) && retryAfter > 0
          ? Math.min(retryAfter * 1000, MAX_BACKOFF_MS)
          : backoff(attempt);
        logger.warn("HTTP-ошибка, повтор", { method, status: response.status, delay, attempt, maxRetries: MAX_RETRIES });
        lastError = parseVoxError(await safeBody(response), response.status).message;
        await sleep(delay);
        continue;
      }

      return { data: null, error: parseVoxError(await safeBody(response), response.status).message };
    } catch (err) {
      clearTimeout(timer);
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      const msg = isAbort
        ? "Voximplant API: таймаут запроса"
        : `Voximplant API: сетевая ошибка (${(err as Error).message})`;

      // Сеть / таймаут — ретраим только идемпотентный GET.
      if (httpMethod === "GET" && attempt < MAX_RETRIES) {
        logger.warn(isAbort ? "Таймаут, повтор" : "Сетевая ошибка, повтор", { method, attempt, maxRetries: MAX_RETRIES });
        lastError = msg;
        await sleep(backoff(attempt));
        continue;
      }
      return { data: null, error: msg };
    }
  }

  return { data: null, error: lastError };
}

export function voxGet(method: string, params: Record<string, string> = {}): Promise<ApiResult> {
  return call("GET", method, params);
}

export function voxPost(method: string, params: Record<string, string> = {}): Promise<ApiResult> {
  return call("POST", method, params);
}
