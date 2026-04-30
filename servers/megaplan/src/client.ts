/**
 * Megaplan API client.
 *
 * Custom auth that supports BOTH:
 *   1. Direct token via MEGAPLAN_TOKEN env var (preferred)
 *   2. Password grant via MEGAPLAN_LOGIN + MEGAPLAN_PASSWORD (with token caching)
 *
 * Wraps @theyahia/mcp-core's BaseHttpClient. Re-exports megaplanGet/megaplanPost
 * as functional API so tools/* keep their signatures unchanged.
 */

import {
  BaseHttpClient,
  createLogger,
  type AuthStrategy,
} from "@theyahia/mcp-core";

const logger = createLogger("megaplan-mcp");

function getDomain(): string {
  const domain = process.env["MEGAPLAN_DOMAIN"];
  if (!domain) {
    throw new Error(
      "MEGAPLAN_DOMAIN is required (your Megaplan subdomain, e.g. 'mycompany' for mycompany.megaplan.ru).",
    );
  }
  return domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
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

    const response = await fetch(`${getBaseUrl()}/auth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        username: login,
        password,
        grant_type: "password",
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Megaplan auth failed (HTTP ${response.status}): ${text}`);
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
    this.cachedToken = await this.fetchTokenViaPasswordGrant();
    return this.cachedToken;
  }

  async authenticate(req: RequestInit): Promise<RequestInit> {
    const token = await this.getToken();
    const headers = new Headers(req.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return { ...req, headers };
  }
}

const authStrategy = new MegaplanAuthStrategy();

function buildClient(): BaseHttpClient {
  return new BaseHttpClient({
    baseUrl: getBaseUrl(),
    timeout: 15_000,
    maxRetries: 3,
    auth: authStrategy,
    logger,
    headers: { Accept: "application/json" },
  });
}

let _client: BaseHttpClient | null = null;
function getClient(): BaseHttpClient {
  if (!_client) _client = buildClient();
  return _client;
}

export function resetClient(): void {
  _client = null;
  authStrategy.invalidate();
}

export async function megaplanGet(
  path: string,
  params?: Record<string, string>,
): Promise<unknown> {
  return getClient().request({ method: "GET", path, params });
}

export async function megaplanPost(path: string, body: unknown): Promise<unknown> {
  return getClient().request({ method: "POST", path, body });
}
