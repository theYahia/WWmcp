import type { AuthProvider, OAuthTokenResponse, StoredTokens } from "../types.js";
import { type OAuthConfig, refreshAccessToken } from "./oauth.js";
import { defaultTokenStorePath, loadTokens, saveTokens } from "./tokenStore.js";

/**
 * Runtime auth provider for the MCP server. It does NOT run the interactive
 * authorize step — that happens once via the `auth` command. At runtime it
 * loads the persisted refresh token (or TOCHKA_REFRESH_TOKEN) and keeps a fresh
 * access token, refreshing on expiry and rotating the stored refresh token.
 */
export class OAuthAuthProvider implements AuthProvider {
  private readonly cfg: OAuthConfig;
  private readonly storePath: string;
  private accessToken: string | null = null;
  private expiresAt = 0;
  private refreshPromise: Promise<string> | null = null;

  constructor(cfg: OAuthConfig, storePath: string = defaultTokenStorePath()) {
    this.cfg = cfg;
    this.storePath = storePath;
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.expiresAt) {
      return this.accessToken;
    }
    // Collapse concurrent refreshes into a single in-flight request.
    if (this.refreshPromise) return this.refreshPromise;
    this.refreshPromise = this.obtain().finally(() => {
      this.refreshPromise = null;
    });
    return this.refreshPromise;
  }

  invalidate(): void {
    this.accessToken = null;
    this.expiresAt = 0;
  }

  private async obtain(): Promise<string> {
    const stored = loadTokens(this.storePath) ?? {};

    // Reuse a still-valid persisted access token (e.g. just written by `auth`).
    if (
      stored.accessToken &&
      stored.accessTokenExpiresAt &&
      Date.now() < stored.accessTokenExpiresAt
    ) {
      this.accessToken = stored.accessToken;
      this.expiresAt = stored.accessTokenExpiresAt;
      return this.accessToken;
    }

    const refreshToken = process.env.TOCHKA_REFRESH_TOKEN ?? stored.refreshToken;
    if (!refreshToken) {
      throw new Error(
        "No Tochka refresh token available. Run `npx @theyahia/tochka-bank-mcp auth` to authorize, or set TOCHKA_REFRESH_TOKEN.",
      );
    }

    const tok = await refreshAccessToken(this.cfg, refreshToken);
    return this.apply(tok, stored);
  }

  private apply(tok: OAuthTokenResponse, prev: StoredTokens): string {
    const expiresIn = Number(tok.expires_in);
    const skew = Math.min(60, Math.max(0, expiresIn * 0.1));
    const lifetime = expiresIn - skew;
    this.accessToken = tok.access_token;
    this.expiresAt = lifetime > 0 ? Date.now() + lifetime * 1000 : 0;

    const updated: StoredTokens = {
      ...prev,
      accessToken: tok.access_token,
      accessTokenExpiresAt: this.expiresAt || undefined,
      refreshToken: tok.refresh_token ?? prev.refreshToken,
      scope: tok.scope ?? prev.scope,
      obtainedAt: Date.now(),
    };
    saveTokens(updated, this.storePath);
    return this.accessToken;
  }
}
