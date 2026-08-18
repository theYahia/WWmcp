import { VkAdsError, parseVkError } from "./errors.js";
import { hasRefreshCredentials } from "./config.js";

const BASE_URL = "https://ads.vk.com/api/v2";
// VERIFY: точный OAuth2 token endpoint. Подтверждён формат /api/v2/oauth2/token.json (Luckyenough64/VK-new-cab),
// но не проверен живым токеном.
const OAUTH_TOKEN_URL = `${BASE_URL}/oauth2/token.json`;
const TIMEOUT = 15_000;
const MAX_RETRIES = 3;
/** Максимальный limit на страницу по оф. документации (default 20, max 50). */
export const PAGE_LIMIT = 50;
/** Сколько объектов максимум собирает авто-пагинация по умолчанию (защита контекста/токенов). */
const DEFAULT_MAX_ITEMS = 200;

/** Токен в памяти: позволяет обновить access_token через refresh без рестарта. */
let currentToken: string | undefined;

function getToken(): string {
  const token = currentToken ?? process.env.VK_ADS_TOKEN;
  if (!token) {
    throw new Error("Переменная окружения VK_ADS_TOKEN не задана");
  }
  return token;
}

function buildHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const backoff = (attempt: number) => Math.min(1000 * 2 ** (attempt - 1), 8000);

/** Уважает Retry-After если есть (секунды или HTTP-date); иначе вернёт undefined. */
function retryAfterMs(response: Response): number | undefined {
  const header = response.headers?.get?.("Retry-After");
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(header);
  return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
}

/**
 * Обновляет access_token через refresh_token (OAuth2). Вызывается на 401, если заданы
 * VK_ADS_CLIENT_ID / VK_ADS_CLIENT_SECRET / VK_ADS_REFRESH_TOKEN. Без них — пробрасываем 401.
 * Access_token живёт 86400с (1 день), поэтому статичный токен без refresh ломается ежедневно.
 */
async function refreshAccessToken(): Promise<void> {
  const clientId = process.env.VK_ADS_CLIENT_ID;
  const clientSecret = process.env.VK_ADS_CLIENT_SECRET;
  const refreshToken = process.env.VK_ADS_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new VkAdsError(401, "no_refresh", "Токен истёк, а refresh-креды (VK_ADS_CLIENT_ID/SECRET/REFRESH_TOKEN) не заданы");
  }
  const form = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw parseVkError(res.status, res.statusText, body);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new VkAdsError(401, "refresh_failed", "Ответ OAuth refresh не содержит access_token");
  }
  currentToken = data.access_token;
  // VK Ads может ротировать refresh_token; персистить его мы не можем (stateless) — подсказка в stderr.
  console.error("[vk-ads-mcp] access_token обновлён через refresh_token");
}

/**
 * fetch с ретраями. Политика идемпотентности:
 *  - 429 (throttling): ретраим ЛЮБОЙ метод с backoff (учитываем Retry-After).
 *  - 5xx и сетевые ошибки/таймаут: ретраим ТОЛЬКО GET (POST-create мог бы продублироваться).
 *  - 4xx (кроме 429): не ретраим — кидаем VkAdsError.
 */
async function fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
  const method = (options.method ?? "GET").toUpperCase();
  const idempotent = method === "GET";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);

      if (response.ok) return response;

      if (response.status === 429 && attempt < MAX_RETRIES) {
        const wait = retryAfterMs(response) ?? backoff(attempt);
        console.error(`[vk-ads-mcp] 429 throttling от ${url}, повтор через ${wait}мс (${attempt}/${MAX_RETRIES})`);
        await sleep(wait);
        continue;
      }

      if (response.status >= 500 && idempotent && attempt < MAX_RETRIES) {
        const wait = backoff(attempt);
        console.error(`[vk-ads-mcp] ${response.status} от ${url}, повтор через ${wait}мс (${attempt}/${MAX_RETRIES})`);
        await sleep(wait);
        continue;
      }

      const body = await response.text().catch(() => "");
      throw parseVkError(response.status, response.statusText, body);
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof VkAdsError) throw error; // финальная ошибка API — не ретраим
      // Сетевая ошибка / таймаут: ретраим только идемпотентные GET
      const isAbort = error instanceof DOMException && error.name === "AbortError";
      if (idempotent && attempt < MAX_RETRIES) {
        console.error(`[vk-ads-mcp] ${isAbort ? "таймаут" : "сетевая ошибка"} ${url}, повтор (${attempt}/${MAX_RETRIES})`);
        await sleep(backoff(attempt));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Все попытки исчерпаны");
}

/** Выполняет запрос; на 401 (при наличии refresh-кред) обновляет токен и повторяет один раз. */
async function call(method: string, url: string, body?: unknown): Promise<unknown> {
  const exec = () => {
    const options: RequestInit = { method, headers: buildHeaders() };
    if (body !== undefined) options.body = JSON.stringify(body);
    return fetchWithRetry(url, options);
  };

  let response: Response;
  try {
    response = await exec();
  } catch (error) {
    if (error instanceof VkAdsError && error.status === 401 && hasRefreshCredentials()) {
      await refreshAccessToken();
      response = await exec();
    } else {
      throw error;
    }
  }

  try {
    return await response.json();
  } catch {
    return {}; // пустое/не-JSON тело успешного ответа
  }
}

function buildUrl(path: string, params: Record<string, string> = {}): string {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== "") url.searchParams.set(key, val);
  }
  return url.toString();
}

export async function apiGet(path: string, params: Record<string, string> = {}): Promise<unknown> {
  return call("GET", buildUrl(path, params));
}

export async function apiPost(path: string, body: Record<string, unknown> = {}): Promise<unknown> {
  return call("POST", `${BASE_URL}${path}`, body);
}

/** Результат авто-пагинации списка. */
export interface PaginatedResult {
  items: unknown[];
  count: number;
  truncated: boolean;
}

/**
 * Авто-пагинация по limit/offset. Конверт ответа: { count, offset, limit, items }.
 * Собирает до maxItems объектов (защита от раздувания контекста), сообщает truncated.
 */
export async function apiGetPaginated(
  path: string,
  params: Record<string, string> = {},
  maxItems = DEFAULT_MAX_ITEMS,
): Promise<PaginatedResult> {
  const items: unknown[] = [];
  let count = 0;
  let offset = 0;

  for (;;) {
    const page = (await apiGet(path, { ...params, limit: String(PAGE_LIMIT), offset: String(offset) })) as {
      count?: number;
      items?: unknown[];
    };
    const pageItems = Array.isArray(page?.items) ? page.items : [];
    count = typeof page?.count === "number" ? page.count : items.length + pageItems.length;
    items.push(...pageItems);
    offset += pageItems.length;

    if (pageItems.length === 0 || offset >= count || items.length >= maxItems) break;
  }

  const truncated = items.length < count;
  return { items: items.slice(0, maxItems), count, truncated };
}
