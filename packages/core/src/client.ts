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
    const url = opts.path.startsWith("http")
      ? `${opts.path}${query}`
      : `${this.baseUrl}${opts.path}${query}`;
    const requestTimeout = opts.timeout ?? this.timeout;

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

        // Retryable server errors
        if (
          (response.status === 429 || response.status >= 500) &&
          attempt < this.maxRetries
        ) {
          const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
          this.logger?.warn("Retryable error, backing off", {
            status: response.status,
            delay,
            attempt,
            path: opts.path,
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
          `HTTP ${response.status}: ${response.statusText}`,
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
          if (attempt < this.maxRetries) {
            this.logger?.warn("Request timeout, retrying", {
              attempt,
              path: opts.path,
            });
            continue;
          }
          throw new ApiError(
            0,
            `Таймаут запроса (${requestTimeout / 1000}с). API не ответил вовремя.`,
          );
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
