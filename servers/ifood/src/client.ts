const DEFAULT_BASE_URL = "https://merchant-api.ifood.com.br";
const DEFAULT_TOKEN_PATH = "/authentication/v1.0/oauth/token";
const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_ATTEMPTS = 3; // 1 initial + 2 retries

export interface RequestOptions {
  /** Extra request headers (e.g. `x-polling-merchants`). Merged over the defaults. */
  headers?: Record<string, string>;
  /** Query-string params appended to the path. */
  query?: Record<string, string | number | boolean | undefined>;
  /** Allow retrying transient 5xx/network failures even for non-GET methods. iFood
   *  state transitions (confirm/dispatch/startPreparation/readyToPickup) are idempotent. */
  retryOnWrite?: boolean;
}

export class IfoodClient {
  private ifood_client_id: string;
  private ifood_client_secret: string;
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  private readonly baseUrl: string;
  private readonly tokenUrl: string;
  private readonly timeout: number;
  private readonly maxAttempts: number;

  constructor() {
    // Read credentials but DO NOT throw here. Throwing in the constructor while tools
    // instantiate the client at import time crashes the process before the MCP
    // transport connects. Validation is deferred to the first request (ensureToken).
    this.ifood_client_id = process.env.IFOOD_CLIENT_ID ?? "";
    this.ifood_client_secret = process.env.IFOOD_CLIENT_SECRET ?? "";

    this.baseUrl = process.env.IFOOD_BASE_URL?.replace(/\/$/, "") || DEFAULT_BASE_URL;
    this.tokenUrl = process.env.IFOOD_TOKEN_URL || `${this.baseUrl}${DEFAULT_TOKEN_PATH}`;
    const t = Number(process.env.IFOOD_TIMEOUT_MS);
    this.timeout = Number.isFinite(t) && t > 0 ? t : DEFAULT_TIMEOUT_MS;
    const a = Number(process.env.IFOOD_MAX_ATTEMPTS);
    this.maxAttempts = Number.isInteger(a) && a >= 1 ? a : DEFAULT_MAX_ATTEMPTS;
  }

  private async ensureToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) return this.accessToken;
    if (!this.ifood_client_id || !this.ifood_client_secret) {
      throw new Error(
        "Environment variable(s) IFOOD_CLIENT_ID and IFOOD_CLIENT_SECRET required. See https://developer.ifood.com.br/docs/",
      );
    }
    const response = await fetch(this.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: this.ifood_client_id,
        client_secret: this.ifood_client_secret,
      }),
    });
    if (!response.ok) throw new Error(`iFood token error: ${response.status}`);
    const data = (await response.json()) as { access_token: string; expires_in?: number };
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + ((data.expires_in ?? 3600) - 60) * 1000;
    return this.accessToken;
  }

  async request(
    method: string,
    path: string,
    body?: unknown,
    opts: RequestOptions = {},
  ): Promise<unknown> {
    const url = this.buildUrl(path, opts.query);
    const retryable = method.toUpperCase() === "GET" || opts.retryOnWrite === true;
    let refreshed = false;

    for (let attempt = 1; ; attempt++) {
      const token = await this.ensureToken();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeout);
      let response: Response;
      try {
        response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...opts.headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
      } catch (error) {
        clearTimeout(timer);
        const isTimeout = error instanceof DOMException && error.name === "AbortError";
        // Retry transient network/timeout failures (only for retryable methods).
        if (retryable && attempt < this.maxAttempts) {
          await this.sleep(this.backoff(attempt));
          continue;
        }
        if (isTimeout) {
          throw new Error(`iFood: request timeout (${Math.round(this.timeout / 1000)}s).`);
        }
        throw error;
      }
      clearTimeout(timer);

      // A server-rejected token (revoked/rotated/clock skew) yields 401 even when our
      // local expiry clock says the token is still valid. Drop it and re-auth once.
      if (response.status === 401 && !refreshed) {
        refreshed = true;
        this.accessToken = null;
        this.tokenExpiry = 0;
        continue;
      }

      // Retry rate-limits (429, safe — request was not processed) and transient 5xx.
      const isTransient = response.status === 429 || response.status >= 500;
      if (isTransient && attempt < this.maxAttempts && (retryable || response.status === 429)) {
        const retryAfter = this.parseRetryAfter(response);
        await this.sleep(retryAfter ?? this.backoff(attempt));
        continue;
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`iFood HTTP ${response.status}: ${text}`);
      }

      return this.parseBody(response);
    }
  }

  private buildUrl(path: string, query?: RequestOptions["query"]): string {
    let url = `${this.baseUrl}${path}`;
    if (query) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined) params.append(k, String(v));
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }
    return url;
  }

  /** iFood returns 202 (state transitions), 204 (no events / DELETE), and 201 with
   *  minimal bodies. Calling response.json() on an empty body throws — guard first. */
  private async parseBody(response: Response): Promise<unknown> {
    if (response.status === 204 || response.status === 202) return null;
    const text = await response.text();
    if (!text) return null;
    const ct = response.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) return JSON.parse(text);
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  private parseRetryAfter(response: Response): number | null {
    const h = response.headers.get("retry-after");
    if (!h) return null;
    const secs = Number(h);
    if (Number.isFinite(secs)) return secs * 1000;
    const date = Date.parse(h);
    return Number.isFinite(date) ? Math.max(0, date - Date.now()) : null;
  }

  private backoff(attempt: number): number {
    const base = Math.min(1000 * 2 ** (attempt - 1), 8000);
    return base + Math.floor(Math.random() * 250);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

let _client: IfoodClient | null = null;

/** Lazy shared singleton. Tools call this at request time so all tools share one
 *  OAuth token cache (a fresh `new IfoodClient()` per tool meant N token fetches). */
export function getClient(): IfoodClient {
  return (_client ??= new IfoodClient());
}
