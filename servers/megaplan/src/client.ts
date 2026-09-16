/**
 * Megaplan API v3 client.
 *
 * Auth supports BOTH:
 *   1. Direct token via MEGAPLAN_TOKEN env var (preferred)
 *   2. Password grant via MEGAPLAN_LOGIN + MEGAPLAN_PASSWORD (with token caching)
 *
 * Wraps @theyahia/mcp-core's BaseHttpClient (retry, timeout, 401 re-auth,
 * logging). Re-exports megaplanGet/megaplanPost as a functional API so tools/*
 * keep their signatures unchanged.
 */

import {
  ApiError,
  BaseHttpClient,
  createLogger,
  type AuthStrategy,
} from "@theyahia/mcp-core";

const logger = createLogger("megaplan-mcp");

function getDomain(): string {
  const raw = process.env["MEGAPLAN_DOMAIN"];
  if (!raw) {
    throw new Error(
      "MEGAPLAN_DOMAIN is required (your Megaplan subdomain, e.g. 'mycompany' for mycompany.megaplan.ru).",
    );
  }
  let domain = raw.replace(/^https?:\/\//i, "").replace(/\/+$/, "").trim();
  // Config-time SSRF guard: a bare host[:port] only — no path, credentials, or spaces.
  if (!/^[a-zA-Z0-9.\-]+(:[0-9]+)?$/.test(domain)) {
    throw new Error(
      `MEGAPLAN_DOMAIN is invalid: "${raw}". Provide a bare host like "yourcompany" or "yourcompany.megaplan.ru".`,
    );
  }
  // A bare subdomain ("yourcompany") is expanded to "yourcompany.megaplan.ru".
  if (!domain.includes(".")) domain = `${domain}.megaplan.ru`;
  return domain;
}

function getBaseUrl(): string {
  return `https://${getDomain()}/api/v3`;
}

/**
 * Megaplan auth strategy: direct token OR Password grant flow with caching.
 *
 * On 401, BaseHttpClient calls invalidate() — this clears the cache so the next
 * request re-authenticates with fresh credentials.
 */
class MegaplanAuthStrategy implements AuthStrategy {
  readonly type = "megaplan_password_grant";
  private cachedToken: string | null = null;
  // Single in-flight auth shared by concurrent callers — otherwise a cold start
  // (or one 401 under load) fires a password grant per pending request.
  private authPromise: Promise<string> | null = null;

  invalidate(): void {
    this.cachedToken = null;
  }

  private async fetchTokenViaPasswordGrant(): Promise<string> {
    const login = process.env["MEGAPLAN_LOGIN"];
    const password = process.env["MEGAPLAN_PASSWORD"];
    if (!login || !password) {
      throw new Error(
        "Either MEGAPLAN_TOKEN or both MEGAPLAN_LOGIN + MEGAPLAN_PASSWORD must be set.",
      );
    }

    // The v3 access_token endpoint expects OAuth2 password-grant form fields,
    // not a JSON body.
    const body = new URLSearchParams({
      username: login,
      password,
      grant_type: "password",
    });

    const response = await fetch(`${getBaseUrl()}/auth/access_token`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body,
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Megaplan auth failed (HTTP ${response.status})${snippet(text)}`);
    }

    const data = (await response.json()) as {
      access_token?: string;
      data?: { access_token?: string };
    };
    const token = data.access_token ?? data.data?.access_token;
    if (!token) throw new Error("Megaplan auth: no access_token in response.");
    return token;
  }

  private async getToken(): Promise<string> {
    const envToken = process.env["MEGAPLAN_TOKEN"];
    if (envToken) return envToken;
    if (this.cachedToken) return this.cachedToken;
    if (this.authPromise) return this.authPromise;

    this.authPromise = this.fetchTokenViaPasswordGrant()
      .then((token) => {
        this.cachedToken = token;
        return token;
      })
      .finally(() => {
        this.authPromise = null;
      });
    return this.authPromise;
  }

  async authenticate(req: RequestInit): Promise<RequestInit> {
    const token = await this.getToken();
    const headers = new Headers(req.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return { ...req, headers };
  }
}

const authStrategy = new MegaplanAuthStrategy();

let _client: BaseHttpClient | null = null;
function getClient(): BaseHttpClient {
  if (!_client) {
    _client = new BaseHttpClient({
      baseUrl: getBaseUrl(),
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
  authStrategy.invalidate();
}

/** A short, single-line snippet of an upstream error body. */
function snippet(text: string): string {
  const s = (text ?? "").replace(/\s+/g, " ").trim().slice(0, 200);
  return s ? `: ${s}` : "";
}

/**
 * BaseHttpClient's ApiError carries the body separately from the message, so
 * `createToolError` would show the model a bare "HTTP 422" with no reason.
 * Re-throw with the upstream explanation folded into the message.
 */
async function request(method: string, path: string, body?: unknown): Promise<unknown> {
  try {
    return await getClient().request({ method, path, body });
  } catch (error) {
    if (error instanceof ApiError && error.body) {
      throw new ApiError(
        error.status,
        `${error.message}${snippet(error.body)}`,
        error.body,
        error.headers,
        error.code,
      );
    }
    throw error;
  }
}

/**
 * v3 collection endpoints take a SINGLE JSON object (limit, filter, pageAfter, …)
 * URL-encoded into the query string — not flat `filter[field]=value` params.
 */
export async function megaplanGet(
  path: string,
  params?: Record<string, unknown>,
): Promise<unknown> {
  const query =
    params && Object.keys(params).length > 0
      ? `?${encodeURIComponent(JSON.stringify(params))}`
      : "";
  return request("GET", `${path}${query}`);
}

export async function megaplanPost(path: string, body: unknown): Promise<unknown> {
  return request("POST", path, body);
}
