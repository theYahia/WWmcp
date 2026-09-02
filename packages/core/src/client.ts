/**
 * Base HTTP client with retry, timeout, and exponential backoff.
 *
 * Consolidates the retry/timeout/error pattern duplicated across all 53 servers
 * into a single reusable class.
 */

import type { AuthStrategy } from "./auth/index.js";
import type { Logger } from "./logging.js";

export interface BaseClientOptions {
  baseUrl: string;
  timeout?: number;
  maxRetries?: number;
  auth?: AuthStrategy;
  logger?: Logger;
  /** Custom headers applied to every request */
  headers?: Record<string, string>;
}

export interface RequestOptions {
  method?: string;
  path: string;
  body?: unknown;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  /** Override timeout for this specific request */
  timeout?: number;
}

/**
 * Appended to every ambiguous failure of a mutating request (timeout, 5xx,
 * socket error). The request may well have reached the API and been applied —
 * an automatic repeat would create a duplicate object in the customer's live
 * database, so the caller is told to check before repeating by hand.
 */
const MUTATION_NOT_RETRIED =
  "Повтор не выполнен автоматически, потому что операция изменяет данные. " +
  "Проверьте в базе, не создан ли объект, прежде чем повторять.";

/** Transport failures where a repeat of an idempotent request is worth trying. */
const RETRYABLE_NETWORK_CODES = new Set(["ECONNRESET", "ETIMEDOUT", "EAI_AGAIN"]);

/**
 * Node's fetch reports socket failures as `TypeError: fetch failed` and hides
 * the real `ECONNRESET`/`EAI_AGAIN` in the `cause` chain, so a plain
 * `error.code` check never matches.
 */
function networkErrorCode(error: unknown): string | undefined {
  for (let e: unknown = error, depth = 0; e != null && depth < 3; depth++) {
    const code = (e as { code?: unknown }).code;
    if (typeof code === "string") return code;
    e = (e as { cause?: unknown }).cause;
  }
  return undefined;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: string,
    public readonly headers?: Record<string, string>,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class BaseHttpClient {
  protected readonly baseUrl: string;
  protected readonly timeout: number;
  protected readonly maxRetries: number;
  protected readonly auth?: AuthStrategy;
  protected readonly logger?: Logger;
  protected readonly defaultHeaders: Record<string, string>;

  constructor(options: BaseClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.timeout = options.timeout ?? 15_000;
    this.maxRetries = options.maxRetries ?? 3;
    this.auth = options.auth;
    this.logger = options.logger;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...options.headers,
    };
  }

  async get(path: string, params?: Record<string, string>): Promise<unknown> {
    return this.request({ method: "GET", path, params });
  }

  async post(path: string, body?: unknown): Promise<unknown> {
    return this.request({ method: "POST", path, body });
  }

  async put(path: string, body?: unknown): Promise<unknown> {
    return this.request({ method: "PUT", path, body });
  }

  async delete(path: string): Promise<unknown> {
    return this.request({ method: "DELETE", path });
  }

  async request(opts: RequestOptions): Promise<unknown> {
    const method = opts.method ?? "GET";
    const query = opts.params
      ? "?" + new URLSearchParams(opts.params).toString()
      : "";
    // SSRF guard: an absolute URL in `path` is only allowed if its origin matches
    // the configured baseUrl. Without this, a tool taking a user-supplied URL
    // (e.g. aprovodka get_report's /hs/... path) could be coerced into fetching an
    // attacker-controlled host WITH the server's auth credentials attached.
    let url: string;
    if (/^https?:\/\//i.test(opts.path)) {
      const target = new URL(opts.path);
      const base = new URL(this.baseUrl);
      if (target.origin !== base.origin) {
        throw new ApiError(
          0,
          `Заблокирован запрос на сторонний хост ${target.origin}: разрешён только ${base.origin}.`,
        );
      }
      url = `${opts.path}${query}`;
    } else {
      url = `${this.baseUrl}${opts.path}${query}`;
    }
    const requestTimeout = opts.timeout ?? this.timeout;
    // Only idempotent methods may be repeated. A timeout or 5xx on POST/PATCH/
    // DELETE does NOT mean the API skipped the work — a 1C document posting
    // routinely runs longer than the timeout — so a retry there duplicates the
    // document (and its ledger movements) in the customer's live database.
    const idempotent = method === "GET" || method === "HEAD";
    // В логи уходит путь БЕЗ query-строки: в $filter лежат ИНН, GUID и суммы из
    // чужой базы, а stderr клиента MCP живёт неопределённо долго. Сущности и
    // метода хватает, чтобы понять, что именно тормозит.
    const logPath = opts.path.split("?")[0];

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), requestTimeout);

      try {
        let reqInit: RequestInit = {
          method,
          headers: { ...this.defaultHeaders, ...opts.headers },
          body: opts.body ? JSON.stringify(opts.body) : undefined,
          signal: controller.signal,
        };

        // Apply auth strategy
        if (this.auth) {
          reqInit = await this.auth.authenticate(reqInit);
        }

        const response = await fetch(url, reqInit);
        clearTimeout(timer);

        if (response.ok) {
          const text = await response.text();
          if (!text) return null;
          try {
            return JSON.parse(text);
          } catch {
            return text;
          }
        }

        // Auth expired — invalidate and retry
        if (
          (response.status === 401 || response.status === 403) &&
          attempt < this.maxRetries &&
          this.auth?.invalidate
        ) {
          this.auth.invalidate();
          this.logger?.warn("Auth token expired, refreshing", {
            attempt,
            status: response.status,
          });
          continue;
        }

        const errorBody = await response.text();

        const ambiguous = response.status === 429 || response.status >= 500;

        // Retryable server errors
        if (ambiguous && idempotent && attempt < this.maxRetries) {
          const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
          this.logger?.warn("Retryable error, backing off", {
            status: response.status,
            delay,
            attempt,
            path: logPath,
          });
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        // Build response headers map for ApiError
        const respHeaders: Record<string, string> = {};
        response.headers.forEach((v, k) => {
          respHeaders[k] = v;
        });

        throw new ApiError(
          response.status,
          `HTTP ${response.status}: ${response.statusText}` +
            (ambiguous && !idempotent ? `\n${MUTATION_NOT_RETRIED}` : ""),
          errorBody,
          respHeaders,
        );
      } catch (error) {
        clearTimeout(timer);

        if (error instanceof ApiError) throw error;

        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          if (idempotent && attempt < this.maxRetries) {
            this.logger?.warn("Request timeout, retrying", {
              attempt,
              path: logPath,
            });
            continue;
          }
          throw new ApiError(
            0,
            `Таймаут запроса (${requestTimeout / 1000}с). API не ответил вовремя.` +
              (idempotent ? "" : `\n${MUTATION_NOT_RETRIED}`),
          );
        }

        // Socket-level failures — the class retries actually exist for. No
        // backoff, same as the timeout path above: the connection is already
        // gone, there is nothing to let cool down.
        const netCode = networkErrorCode(error);
        if (netCode && RETRYABLE_NETWORK_CODES.has(netCode)) {
          if (idempotent && attempt < this.maxRetries) {
            this.logger?.warn("Network error, retrying", {
              attempt,
              code: netCode,
              path: logPath,
            });
            continue;
          }
          if (!idempotent) {
            throw new ApiError(
              0,
              `Сбой сети (${netCode}). ${MUTATION_NOT_RETRIED}`,
            );
          }
        }

        throw error;
      }
    }

    throw new ApiError(0, "Все попытки запроса исчерпаны");
  }
}

/**
 * Token bucket rate limiter.
 * Used by MoySklad (45 req/3s) and similar APIs with strict rate limits.
 */
export class TokenBucketLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private readonly maxTokens: number,
    private readonly refillMs: number,
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    if (elapsed >= this.refillMs) {
      this.tokens = this.maxTokens;
      this.lastRefill = now;
    }
    if (this.tokens > 0) {
      this.tokens--;
      return;
    }
    const waitMs = this.refillMs - (Date.now() - this.lastRefill);
    if (waitMs > 0) {
      await new Promise((r) => setTimeout(r, waitMs));
    }
    this.tokens = this.maxTokens - 1;
    this.lastRefill = Date.now();
  }
}

/**
 * Extended client with token bucket rate limiting.
 */
export class RateLimitedClient extends BaseHttpClient {
  private readonly limiter: TokenBucketLimiter;

  constructor(
    options: BaseClientOptions & { bucketMax: number; bucketRefillMs: number },
  ) {
    super(options);
    this.limiter = new TokenBucketLimiter(
      options.bucketMax,
      options.bucketRefillMs,
    );
  }

  override async request(opts: RequestOptions): Promise<unknown> {
    await this.limiter.acquire();
    return super.request(opts);
  }
}
