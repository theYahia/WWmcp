/**
 * bKash Tokenized Checkout client.
 *
 * Custom 3-step auth (Brave-verified at developer.bka.sh / sandbox.bka.sh):
 *   1. Grant Token: POST /tokenized/checkout/token/grant with body
 *      { app_key, app_secret } and headers { username, password }
 *      → returns { id_token, refresh_token, expires_in }
 *   2. Use id_token in Authorization header for subsequent calls (no "Bearer" prefix)
 *      plus X-APP-Key: <app_key>
 *   3. On 401, POST /tokenized/checkout/token/refresh with refresh_token to renew
 *
 * Base URLs:
 *   Sandbox:    https://tokenized.sandbox.bka.sh/v1.2.0-beta
 *   Production: https://tokenized.pay.bka.sh/v1.2.0-beta
 */

import {
  BaseHttpClient,
  createLogger,
  type AuthStrategy,
} from "@theyahia/mcp-core";

const logger = createLogger("bkash-mcp");

function getBaseUrl(): string {
  const sandbox = process.env["BKASH_SANDBOX"] === "true";
  return sandbox
    ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
    : "https://tokenized.pay.bka.sh/v1.2.0-beta";
}

function getCredentials(): {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
} {
  const appKey = process.env["BKASH_APP_KEY"];
  const appSecret = process.env["BKASH_APP_SECRET"];
  const username = process.env["BKASH_USERNAME"];
  const password = process.env["BKASH_PASSWORD"];
  if (!appKey || !appSecret || !username || !password) {
    throw new Error(
      "BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_USERNAME, and BKASH_PASSWORD are all required. Get them at https://developer.bka.sh/.",
    );
  }
  return { appKey, appSecret, username, password };
}

/**
 * bKash auth strategy: token grant flow with refresh on 401.
 * Caches id_token in memory; clears it on invalidate() (called by BaseHttpClient on 401).
 */
class BkashAuthStrategy implements AuthStrategy {
  readonly type = "bkash_token_grant";
  private idToken: string | null = null;
  private refreshToken: string | null = null;
  private appKey: string;

  constructor() {
    this.appKey = process.env["BKASH_APP_KEY"] ?? "";
  }

  invalidate(): void {
    this.idToken = null;
    this.refreshToken = null;
  }

  private async fetchGrantToken(): Promise<{ idToken: string; refreshToken: string }> {
    const creds = getCredentials();
    this.appKey = creds.appKey;
    const response = await fetch(`${getBaseUrl()}/tokenized/checkout/token/grant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        username: creds.username,
        password: creds.password,
      },
      body: JSON.stringify({
        app_key: creds.appKey,
        app_secret: creds.appSecret,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`bKash grant token failed (HTTP ${response.status}): ${text}`);
    }

    const data = (await response.json()) as {
      id_token?: string;
      refresh_token?: string;
      statusCode?: string;
      statusMessage?: string;
    };
    if (!data.id_token) {
      throw new Error(`bKash grant token: no id_token in response (statusCode=${data.statusCode}, statusMessage=${data.statusMessage})`);
    }
    return { idToken: data.id_token, refreshToken: data.refresh_token ?? "" };
  }

  private async tryRefresh(): Promise<{ idToken: string; refreshToken: string } | null> {
    if (!this.refreshToken) return null;
    const creds = getCredentials();
    const response = await fetch(`${getBaseUrl()}/tokenized/checkout/token/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        username: creds.username,
        password: creds.password,
      },
      body: JSON.stringify({
        app_key: creds.appKey,
        app_secret: creds.appSecret,
        refresh_token: this.refreshToken,
      }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { id_token?: string; refresh_token?: string };
    if (!data.id_token) return null;
    return { idToken: data.id_token, refreshToken: data.refresh_token ?? this.refreshToken };
  }

  private async getToken(): Promise<string> {
    if (this.idToken) return this.idToken;
    const refreshed = await this.tryRefresh();
    if (refreshed) {
      this.idToken = refreshed.idToken;
      this.refreshToken = refreshed.refreshToken;
      return this.idToken;
    }
    const granted = await this.fetchGrantToken();
    this.idToken = granted.idToken;
    this.refreshToken = granted.refreshToken;
    return this.idToken;
  }

  async authenticate(req: RequestInit): Promise<RequestInit> {
    const token = await this.getToken();
    const headers = new Headers(req.headers);
    // bKash requires raw token in Authorization, no "Bearer" prefix
    headers.set("Authorization", token);
    headers.set("X-APP-Key", this.appKey || (process.env["BKASH_APP_KEY"] ?? ""));
    return { ...req, headers };
  }
}

const authStrategy = new BkashAuthStrategy();

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

export async function bkashPost(path: string, body: unknown): Promise<unknown> {
  return getClient().request({ method: "POST", path, body });
}
