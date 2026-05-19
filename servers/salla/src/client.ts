/**
 * Salla API client.
 *
 * Wraps @theyahia/mcp-core's BaseHttpClient. Exposes the same
 * `SallaClient.request(method, path, body?)` shape that tools/* expect.
 *
 * Auth modes (auto-detected from env vars):
 *
 *   1. **Static Bearer token** (legacy, simplest):
 *      `SALLA_ACCESS_TOKEN` — long-lived token pasted from Partners Portal.
 *      No refresh; you re-paste after expiry (Salla access tokens last
 *      ~14 days, refresh tokens ~1 month — see Salla OAuth docs).
 *
 *   2. **OAuth refresh** (recommended for production):
 *      `SALLA_OAUTH_CLIENT_ID`, `SALLA_OAUTH_CLIENT_SECRET`,
 *      `SALLA_REFRESH_TOKEN` — the client refreshes its access token
 *      automatically against `https://accounts.salla.sa/oauth2/token`
 *      whenever the cached token is within `expiryBuffer` of expiry.
 *      Optional: `SALLA_ACCESS_TOKEN` (used as the initial token to skip
 *      the first refresh round-trip) and `SALLA_ACCESS_TOKEN_EXPIRES_AT`
 *      (UNIX seconds; defaults to "expired now" → refresh on first request).
 *
 * Lazy init — env vars are only read on the first request, so
 * module-level `new SallaClient()` does not throw at import time.
 */

import {
  BaseHttpClient,
  ApiKeyStrategy,
  createLogger,
  type AuthStrategy,
} from "@theyahia/mcp-core";

const API_BASE_URL = "https://api.salla.dev/admin/v2";
const OAUTH_TOKEN_URL = "https://accounts.salla.sa/oauth2/token";
const logger = createLogger("salla-mcp");

/**
 * Persistence callback. The host (Claude Desktop, an embedding app, etc.)
 * can pass this to receive refreshed token pairs so they survive a restart.
 */
export interface TokenStore {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // UNIX seconds
}

export type PersistCallback = (store: TokenStore) => void | Promise<void>;

interface RefreshConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  initialAccessToken?: string;
  initialExpiresAt?: number;
  expiryBuffer?: number; // ms, default 60s
  persist?: PersistCallback;
}

/**
 * OAuth strategy specialized for Salla's `refresh_token` grant.
 *
 * mcp-core's generic `OAuthStrategy` does `client_credentials` only; Salla
 * apps work with `authorization_code` initially and then `refresh_token` for
 * every subsequent server-to-server call. This class handles that path,
 * deduplicates concurrent refreshes, and supports an optional persistence
 * callback so the new refresh_token (Salla rotates it on every refresh)
 * survives across process restarts.
 */
export class SallaRefreshStrategy implements AuthStrategy {
  readonly type = "salla-oauth-refresh";
  private accessToken: string | null;
  private refreshToken: string;
  private expiresAt: number; // UNIX ms
  private refreshing: Promise<string> | null = null;

  constructor(private readonly config: RefreshConfig) {
    this.accessToken = config.initialAccessToken ?? null;
    this.refreshToken = config.refreshToken;
    this.expiresAt = (config.initialExpiresAt ?? 0) * 1000;
  }

  invalidate(): void {
    this.accessToken = null;
    this.expiresAt = 0;
  }

  async authenticate(req: RequestInit): Promise<RequestInit> {
    const token = await this.getValidToken();
    const headers = new Headers(req.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return { ...req, headers };
  }

  private async getValidToken(): Promise<string> {
    const buffer = this.config.expiryBuffer ?? 60_000;
    if (this.accessToken && Date.now() < this.expiresAt - buffer) {
      return this.accessToken;
    }
    if (this.refreshing) return this.refreshing;

    this.refreshing = this.refresh();
    try {
      return await this.refreshing;
    } finally {
      this.refreshing = null;
    }
  }

  private async refresh(): Promise<string> {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: this.refreshToken,
      scope: "offline_access",
    });

    const response = await fetch(OAUTH_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: body.toString(),
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(
        `Salla OAuth refresh failed (HTTP ${response.status}). Check SALLA_OAUTH_CLIENT_ID / SECRET / refresh_token. Body: ${text.slice(0, 500)}`,
      );
    }

    let data: {
      access_token: string;
      refresh_token?: string;
      expires_in: number; // seconds
      token_type?: string;
    };
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(
        `Salla OAuth refresh: non-JSON response (HTTP ${response.status}). Body: ${text.slice(0, 500)}`,
      );
    }

    this.accessToken = data.access_token;
    // Salla rotates the refresh_token on every refresh — store the new one.
    if (data.refresh_token) {
      this.refreshToken = data.refresh_token;
    }
    this.expiresAt = Date.now() + data.expires_in * 1000;

    if (this.config.persist) {
      await this.config.persist({
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        expiresAt: Math.floor(this.expiresAt / 1000),
      });
    }

    return this.accessToken;
  }

  /** Read-only snapshot — for tests and host inspection. */
  snapshot(): TokenStore | null {
    if (!this.accessToken) return null;
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expiresAt: Math.floor(this.expiresAt / 1000),
    };
  }
}

function buildAuth(): AuthStrategy {
  const refreshToken = process.env["SALLA_REFRESH_TOKEN"];
  const clientId = process.env["SALLA_OAUTH_CLIENT_ID"];
  const clientSecret = process.env["SALLA_OAUTH_CLIENT_SECRET"];
  const accessToken = process.env["SALLA_ACCESS_TOKEN"];
  const expiresAtStr = process.env["SALLA_ACCESS_TOKEN_EXPIRES_AT"];

  // OAuth refresh mode — needs all 3 credentials.
  if (refreshToken && clientId && clientSecret) {
    return new SallaRefreshStrategy({
      clientId,
      clientSecret,
      refreshToken,
      initialAccessToken: accessToken,
      initialExpiresAt: expiresAtStr ? Number(expiresAtStr) : 0,
    });
  }

  // Legacy static token mode.
  if (accessToken) {
    return new ApiKeyStrategy(accessToken);
  }

  throw new Error(
    "Salla auth not configured. Provide either SALLA_ACCESS_TOKEN (static) " +
      "or SALLA_OAUTH_CLIENT_ID + SALLA_OAUTH_CLIENT_SECRET + SALLA_REFRESH_TOKEN " +
      "(auto-refresh). Get credentials from https://salla.partners/ (Apps → OAuth).",
  );
}

function buildClient(): BaseHttpClient {
  return new BaseHttpClient({
    baseUrl: API_BASE_URL,
    timeout: 15_000,
    maxRetries: 3,
    auth: buildAuth(),
    logger,
    headers: { Accept: "application/json" },
  });
}

export class SallaClient {
  private _http: BaseHttpClient | null = null;

  private get http(): BaseHttpClient {
    if (!this._http) this._http = buildClient();
    return this._http;
  }

  /** Reset cached HTTP client — used by tests to force re-read of env vars. */
  reset(): void {
    this._http = null;
  }

  async request(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<unknown> {
    return this.http.request({ method, path, body });
  }
}
