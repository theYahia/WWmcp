/**
 * VK Ads API v2 client (ads.vk.com/api/v2).
 *
 * Built on @theyahia/mcp-core's BaseHttpClient (retry, timeout, idempotency rules:
 * a create POST is never repeated on 5xx/timeout, so no duplicate campaigns) with a
 * custom auth strategy that refreshes an expired access_token via refresh_token —
 * VK access tokens live 86400s, so a static token breaks daily.
 *
 * Re-exports apiGet/apiPost/apiGetPaginated as a functional API so tools/* keep
 * their signatures.
 */

import {
  ApiError,
  BaseHttpClient,
  createLogger,
  type AuthStrategy,
} from "@theyahia/mcp-core";
import { parseVkError } from "./errors.js";

const BASE_URL = "https://ads.vk.com/api/v2";
// VERIFY: точный OAuth2 token endpoint. Подтверждён формат /api/v2/oauth2/token.json
// (Luckyenough64/VK-new-cab), но не проверен живым токеном.
const OAUTH_TOKEN_URL = `${BASE_URL}/oauth2/token.json`;
/** Максимальный limit на страницу по оф. документации (default 20, max 50). */
export const PAGE_LIMIT = 50;
/** Сколько объектов максимум собирает авто-пагинация по умолчанию (защита контекста/токенов). */
const DEFAULT_MAX_ITEMS = 200;

const logger = createLogger("vk-ads-mcp");

/** Доступны ли refresh-креды для авто-обновления истёкшего access_token. */
export function hasRefreshCredentials(): boolean {
  return Boolean(
    process.env["VK_ADS_CLIENT_ID"] &&
      process.env["VK_ADS_CLIENT_SECRET"] &&
      process.env["VK_ADS_REFRESH_TOKEN"],
  );
}

/**
 * Bearer-токен с авто-обновлением. BaseHttpClient зовёт invalidate() на 401/403 и
 * повторяет запрос — на следующем authenticate() мы меняем токен по refresh_token.
 * Без refresh-кред обновления нет, и исходный 401 доходит до вызывающего как есть.
 */
class VkAdsAuthStrategy implements AuthStrategy {
  readonly type = "vk_ads_bearer";
  private refreshedToken: string | null = null;
  private stale = false;

  invalidate(): void {
    this.stale = true;
  }

  /** Test helper: сбросить обновлённый токен между кейсами. */
  reset(): void {
    this.refreshedToken = null;
    this.stale = false;
  }

  async authenticate(req: RequestInit): Promise<RequestInit> {
    if (this.stale) {
      this.stale = false;
      if (hasRefreshCredentials()) await this.refresh();
    }
    const token = this.refreshedToken ?? process.env["VK_ADS_TOKEN"];
    if (!token) {
      throw new Error(
        "VK_ADS_TOKEN не задан. Укажите Bearer-токен VK Ads API в переменной окружения " +
          "(env в конфиге MCP-клиента).",
      );
    }
    const headers = new Headers(req.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return { ...req, headers };
  }

  private async refresh(): Promise<void> {
    const form = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env["VK_ADS_REFRESH_TOKEN"] as string,
      client_id: process.env["VK_ADS_CLIENT_ID"] as string,
      client_secret: process.env["VK_ADS_CLIENT_SECRET"] as string,
    });
    const res = await fetch(OAUTH_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      throw parseVkError(res.status, await res.text().catch(() => ""));
    }
    const data = (await res.json()) as { access_token?: string };
    if (!data.access_token) {
      throw new ApiError(401, "VK Ads: ответ OAuth refresh не содержит access_token");
    }
    this.refreshedToken = data.access_token;
    // VK Ads может ротировать refresh_token; персистить его мы не можем (stateless).
    logger.info("access_token обновлён через refresh_token");
  }
}

const authStrategy = new VkAdsAuthStrategy();

let _client: BaseHttpClient | null = null;
function getClient(): BaseHttpClient {
  if (!_client) {
    _client = new BaseHttpClient({
      baseUrl: BASE_URL,
      timeout: 15_000,
      maxRetries: 3,
      auth: authStrategy,
      logger,
      headers: { Accept: "application/json" },
    });
  }
  return _client;
}

export function resetClient(): void {
  _client = null;
  authStrategy.reset();
}

/**
 * BaseHttpClient кладёт тело ошибки в ApiError.body, а в message оставляет голое
 * "HTTP 400". Прогоняем тело через parseVkError, чтобы модель увидела настоящую
 * причину (три несовместимых формата ошибок VK Ads).
 */
async function request(opts: {
  method: string;
  path: string;
  params?: Record<string, string>;
  body?: unknown;
}): Promise<unknown> {
  try {
    return await getClient().request(opts);
  } catch (error) {
    if (error instanceof ApiError && error.status > 0 && error.body) {
      throw parseVkError(error.status, error.body);
    }
    throw error;
  }
}

export async function apiGet(path: string, params: Record<string, string> = {}): Promise<unknown> {
  return request({ method: "GET", path, params });
}

export async function apiPost(
  path: string,
  body: Record<string, unknown> = {},
): Promise<unknown> {
  return request({ method: "POST", path, body });
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
    const page = (await apiGet(path, {
      ...params,
      limit: String(PAGE_LIMIT),
      offset: String(offset),
    })) as { count?: number; items?: unknown[] };
    const pageItems = Array.isArray(page?.items) ? page.items : [];
    count = typeof page?.count === "number" ? page.count : items.length + pageItems.length;
    items.push(...pageItems);
    offset += pageItems.length;

    if (pageItems.length === 0 || offset >= count || items.length >= maxItems) break;
  }

  return { items: items.slice(0, maxItems), count, truncated: items.length < count };
}
