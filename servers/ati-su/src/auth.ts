/**
 * Token provider for the ATI.su API.
 *
 * Two mutually exclusive modes, selected by environment:
 *   1. static — ATI_TOKEN: a long-lived token from https://ati.su/developers/tokens/.
 *   2. oauth2 — ATI_CLIENT_ID + ATI_CLIENT_SECRET + ATI_REFRESH_TOKEN.
 *      Access tokens live ~2h (https://ati.su/developers/auth/auth-v2/); we cache
 *      and refresh on expiry or on a 401, using grant_type=refresh_token.
 *
 * Security:
 *   - Tokens are returned ONLY to the HTTP layer for the Authorization header.
 *   - Tokens are never logged or placed in error messages surfaced to the model.
 */

import { config } from "./config.js";

export type AuthMode = "static" | "oauth2" | "none";

/** Determines the auth mode from the current environment. Static takes precedence. */
export function authMode(): AuthMode {
  if (process.env.ATI_TOKEN) return "static";
  if (
    process.env.ATI_CLIENT_ID &&
    process.env.ATI_CLIENT_SECRET &&
    process.env.ATI_REFRESH_TOKEN
  ) {
    return "oauth2";
  }
  return "none";
}

export const AUTH_HELP =
  "Configure credentials: set ATI_TOKEN (static token from " +
  "https://ati.su/developers/tokens/), or ATI_CLIENT_ID + ATI_CLIENT_SECRET + " +
  "ATI_REFRESH_TOKEN for OAuth2 (https://ati.su/developers/auth/auth-v2/).";

interface CachedToken {
  accessToken: string;
  expiresAt: number; // epoch ms, already adjusted for skew
}

let cache: CachedToken | null = null;
let refreshing: Promise<string> | null = null;

const EXPIRY_SKEW_MS = 60_000;
const DEFAULT_TTL_S = 7200; // ATI access tokens live ~2h; used only if expires_in is absent

/** Clears the in-memory OAuth2 token cache. Used by tests and on 401 invalidation. */
export function resetAuthCache(): void {
  cache = null;
  refreshing = null;
}

/** Whether a 401 should trigger a token refresh + single retry (OAuth2 only). */
export function canRefresh(): boolean {
  return authMode() === "oauth2";
}

/**
 * Returns a valid bearer token for the current mode, refreshing if necessary.
 * @param forceRefresh invalidate the cache first (used after a 401 in OAuth2 mode).
 */
export async function getAccessToken(forceRefresh = false): Promise<string> {
  const mode = authMode();

  if (mode === "static") return process.env.ATI_TOKEN as string;
  if (mode === "none") throw new Error(`No ATI.su credentials configured. ${AUTH_HELP}`);

  // oauth2
  if (forceRefresh) cache = null;
  if (cache && cache.expiresAt > Date.now()) return cache.accessToken;

  // single-flight: collapse concurrent refreshes into one token request.
  if (!refreshing) {
    refreshing = doRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

async function doRefresh(): Promise<string> {
  // TODO(verify): grant_type literal ("refresh_token" vs numeric "1" from the v2 docs)
  // and body encoding (form-urlencoded vs JSON). Form-encoded is the OAuth2 default.
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: process.env.ATI_CLIENT_ID as string,
    client_secret: process.env.ATI_CLIENT_SECRET as string,
    refresh_token: process.env.ATI_REFRESH_TOKEN as string,
  });

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
    // Without a timeout a hung token endpoint hangs every tool call (parity with core OAuthStrategy).
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`OAuth2 token request failed (HTTP ${res.status}). ${AUTH_HELP}`);
  }

  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) {
    throw new Error("OAuth2 token response did not contain an access_token.");
  }

  const ttlS = typeof data.expires_in === "number" ? data.expires_in : DEFAULT_TTL_S;
  cache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + ttlS * 1000 - EXPIRY_SKEW_MS,
  };
  return cache.accessToken;
}
