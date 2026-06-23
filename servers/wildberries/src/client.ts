/**
 * Wildberries Seller API HTTP client.
 *
 * The Wildberries Seller API is split across several per-category hosts
 * (content, marketplace, statistics, prices, feedbacks, analytics, common,
 * returns, advert). `https://seller.wildberries.ru` is the *web cabinet*, NOT
 * an API gateway — calls must be routed to the correct category host. Every
 * request therefore takes an explicit `host` (see {@link HOSTS}).
 *
 * Features: per-category rate limiting (token bucket + 409 penalty handling),
 * per-request timeouts (AbortController), and structured WB error parsing.
 */
import {
  RateLimiterPool,
  type RateLimitConfig,
} from "./rate-limiter.js";

/** Per-category API host domains. */
export const HOSTS = {
  content: "content-api.wildberries.ru",
  prices: "discounts-prices-api.wildberries.ru",
  marketplace: "marketplace-api.wildberries.ru",
  statistics: "statistics-api.wildberries.ru",
  feedbacks: "feedbacks-api.wildberries.ru",
  analytics: "seller-analytics-api.wildberries.ru",
  common: "common-api.wildberries.ru",
  returns: "returns-api.wildberries.ru",
  advert: "advert-api.wildberries.ru",
} as const;

export type WBHostKey = keyof typeof HOSTS;
export type WBHost = (typeof HOSTS)[WBHostKey];

/** Finer-grained limiter keys for endpoints with their own strict caps. */
export const LIMITER_KEYS = {
  paidStorageCreate: "paid_storage:create",
  paidStorageStatus: "paid_storage:status",
  paidStorageDownload: "paid_storage:download",
  advertBalance: "advert:balance",
} as const;

/**
 * Conservative per-category rate limits. Only the strict per-endpoint caps
 * (paid-storage 1/min create+download, 1/5s status; prices ~10/6s) are
 * documented by WB; the rest are deliberately cautious and safe to tune up
 * after live observation. Unknown keys fall back to 300/min + 200ms.
 */
export const HOST_LIMITS: Record<string, RateLimitConfig> = {
  [HOSTS.content]: { rpm: 100, minIntervalMs: 120 },
  [HOSTS.prices]: { rpm: 100, minIntervalMs: 600 }, // ~10 req / 6s
  [HOSTS.marketplace]: { rpm: 300, minIntervalMs: 200 },
  [HOSTS.statistics]: { rpm: 60, minIntervalMs: 600 },
  [HOSTS.feedbacks]: { rpm: 60, minIntervalMs: 600 },
  [HOSTS.analytics]: { rpm: 60, minIntervalMs: 1000 },
  [HOSTS.common]: { rpm: 60, minIntervalMs: 1000 },
  [HOSTS.returns]: { rpm: 100, minIntervalMs: 300 },
  [HOSTS.advert]: { rpm: 60, minIntervalMs: 1000 },
  // Per-endpoint strict caps (documented by WB):
  [LIMITER_KEYS.paidStorageCreate]: { rpm: 1, minIntervalMs: 1000 },
  [LIMITER_KEYS.paidStorageDownload]: { rpm: 1, minIntervalMs: 1000 },
  [LIMITER_KEYS.paidStorageStatus]: { rpm: 12, minIntervalMs: 5000 }, // 1 / 5s
  [LIMITER_KEYS.advertBalance]: { rpm: 60, minIntervalMs: 1000 },
};

export interface WBClientOptions {
  token: string;
  maxRetries?: number;
  /** Per-request timeout in ms (default 30000, or WB_TIMEOUT_MS env). */
  timeoutMs?: number;
  /** Override a host domain -> domain (sandbox/testing). */
  hostOverrides?: Record<string, string>;
}

export interface RequestOptions {
  query?: Record<string, string | undefined>;
  /** Rate-limiter key override (defaults to the host). */
  limiterKey?: string;
  /** How to decode a successful body (default "json"). "text" for barcodes. */
  responseType?: "json" | "text";
  /** Per-call timeout override in ms. */
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 30_000;

export class WBClient {
  private readonly token: string;
  private readonly pool: RateLimiterPool;
  private readonly maxRetries: number;
  private readonly timeoutMs: number;
  private readonly hostOverrides: Record<string, string>;

  constructor(options: WBClientOptions) {
    this.token = options.token;
    this.pool = new RateLimiterPool(HOST_LIMITS, { rpm: 300, minIntervalMs: 200 });
    this.maxRetries = options.maxRetries ?? 3;
    const envTimeout = process.env["WB_TIMEOUT_MS"] ? parseInt(process.env["WB_TIMEOUT_MS"], 10) : NaN;
    this.timeoutMs =
      options.timeoutMs ?? (Number.isFinite(envTimeout) && envTimeout > 0 ? envTimeout : DEFAULT_TIMEOUT_MS);
    this.hostOverrides = options.hostOverrides ?? {};
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  async request<T = unknown>(
    method: string,
    host: WBHost,
    path: string,
    body?: unknown,
    opts: RequestOptions = {},
  ): Promise<T> {
    const resolvedHost = this.hostOverrides[host] ?? host;
    const url = new URL(path, `https://${resolvedHost}`);
    if (opts.query) {
      for (const [k, v] of Object.entries(opts.query)) {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      }
    }
    const urlStr = url.toString();
    const limiter = this.pool.for(opts.limiterKey ?? host);
    const timeoutMs = opts.timeoutMs ?? this.timeoutMs;
    const responseType = opts.responseType ?? "json";

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      await limiter.acquire();

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      let response: Response;
      try {
        const init: RequestInit = {
          method,
          headers: this.headers(),
          signal: controller.signal,
        };
        if (body !== undefined) init.body = JSON.stringify(body);
        response = await fetch(urlStr, init);
      } catch (err) {
        clearTimeout(timer);
        const aborted = err instanceof Error && err.name === "AbortError";
        lastError = new Error(
          aborted
            ? `WB API ${method} ${resolvedHost}${path} timed out after ${timeoutMs}ms`
            : `WB API ${method} ${resolvedHost}${path} network error: ${
                err instanceof Error ? err.message : String(err)
              }`,
        );
        // A timeout already consumed the full budget — retrying it just multiplies
        // latency. Retry transient network errors only.
        if (!aborted && attempt < this.maxRetries) {
          await this.sleep(1000 * (attempt + 1));
          continue;
        }
        throw lastError;
      }
      clearTimeout(timer);

      // Handle 409 penalty (WB rate-limit penalty)
      if (response.status === 409) {
        limiter.applyPenalty(5);
        const waitMs = limiter.handlePenalty(response.headers);
        if (attempt < this.maxRetries) {
          await this.sleep(waitMs);
          continue;
        }
      }

      if (!response.ok) {
        const detail = await this.extractError(response);
        lastError = new Error(
          `WB API ${method} ${resolvedHost}${path} → ${response.status}: ${detail}`,
        );
        if (response.status >= 500 && attempt < this.maxRetries) {
          await this.sleep(1000 * (attempt + 1));
          continue;
        }
        throw lastError;
      }

      // Some endpoints return 204 No Content
      if (response.status === 204) return undefined as T;

      if (responseType === "text") {
        return (await response.text()) as unknown as T;
      }
      return (await response.json()) as T;
    }

    throw (
      lastError ??
      new Error(`WB API ${method} ${resolvedHost}${path} failed after ${this.maxRetries} retries`)
    );
  }

  /** Parse a WB error body into a concise, human-readable message. */
  private async extractError(response: Response): Promise<string> {
    const text = await response.text().catch(() => "");
    if (!text) return response.statusText || "(no response body)";
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return text.slice(0, 500);
    }
    if (parsed && typeof parsed === "object") {
      const o = parsed as Record<string, unknown>;
      const msg =
        o["errorText"] ??
        o["detail"] ??
        o["title"] ??
        o["message"] ??
        o["error"] ??
        text;
      const requestId = o["requestId"] ?? o["request_id"];
      const msgStr = typeof msg === "string" ? msg : JSON.stringify(msg);
      return requestId ? `${msgStr} (requestId=${requestId})` : msgStr;
    }
    return text.slice(0, 500);
  }

  /**
   * Poll `fn` until `done` returns true, or `timeoutMs` elapses. Used for the
   * async report endpoints (e.g. paid storage: create -> poll status -> download).
   */
  async pollUntil<T>(opts: {
    fn: () => Promise<T>;
    done: (result: T) => boolean;
    intervalMs?: number;
    timeoutMs?: number;
    label?: string;
  }): Promise<T> {
    const interval = opts.intervalMs ?? 5000;
    const timeout = opts.timeoutMs ?? 120_000;
    const start = Date.now();
    let result = await opts.fn();
    while (!opts.done(result)) {
      if (Date.now() - start > timeout) {
        throw new Error(
          `pollUntil timed out after ${timeout}ms${opts.label ? ` (${opts.label})` : ""}`,
        );
      }
      await this.sleep(interval);
      result = await opts.fn();
    }
    return result;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async get<T = unknown>(
    host: WBHost,
    path: string,
    query?: Record<string, string | undefined>,
    opts?: Omit<RequestOptions, "query">,
  ): Promise<T> {
    return this.request<T>("GET", host, path, undefined, { ...opts, query });
  }

  async post<T = unknown>(
    host: WBHost,
    path: string,
    body?: unknown,
    query?: Record<string, string | undefined>,
    opts?: Omit<RequestOptions, "query">,
  ): Promise<T> {
    return this.request<T>("POST", host, path, body, { ...opts, query });
  }

  async put<T = unknown>(
    host: WBHost,
    path: string,
    body?: unknown,
    query?: Record<string, string | undefined>,
    opts?: Omit<RequestOptions, "query">,
  ): Promise<T> {
    return this.request<T>("PUT", host, path, body, { ...opts, query });
  }

  async patch<T = unknown>(
    host: WBHost,
    path: string,
    body?: unknown,
    query?: Record<string, string | undefined>,
    opts?: Omit<RequestOptions, "query">,
  ): Promise<T> {
    return this.request<T>("PATCH", host, path, body, { ...opts, query });
  }
}
