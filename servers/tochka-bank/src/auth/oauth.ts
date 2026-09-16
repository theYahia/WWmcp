// Low-level OAuth 2.0 hybrid-flow primitives for the Tochka API.
//
// The flow (https://developers.tochka.com/docs/tochka-api/algoritm-raboty-po-oauth-2.0):
//   1. client_credentials  -> a bootstrap token used ONLY to create a consent
//   2. POST {base}/v1.0/consents with a permissions[] list -> consentId
//   3. user approves at {authBase}/connect/authorize?...&consent_id=...
//   4. authorization_code  -> Access Token Hybrid (24h) + Refresh Token (30d)
//   5. refresh_token       -> rotate the access token
//
// The /connect/* endpoints live at the host root, NOT under the /uapi base path.

import { redact } from "../redact.js";
import type { OAuthTokenResponse } from "../types.js";

export const DEFAULT_SCOPE = "accounts balances customers statements sbp payments";

export const DEFAULT_PERMISSIONS = [
  "ReadAccountsBasic",
  "ReadAccountsDetail",
  "ReadBalances",
  "ReadStatements",
  "ReadCustomerData",
  "CreatePaymentForSign",
  "CreatePaymentOrder",
];

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  /** API base, e.g. https://enter.tochka.com/uapi */
  baseUrl: string;
  /** Override the host for /connect/* endpoints; defaults to the base URL origin. */
  authBaseUrl?: string;
  timeoutMs?: number;
}

function authBase(cfg: OAuthConfig): string {
  return (cfg.authBaseUrl ?? new URL(cfg.baseUrl).origin).replace(/\/+$/, "");
}

function timeout(cfg: OAuthConfig): AbortSignal {
  return AbortSignal.timeout(cfg.timeoutMs ?? 15000);
}

async function requestToken(
  cfg: OAuthConfig,
  params: Record<string, string>,
): Promise<OAuthTokenResponse> {
  let resp: Response;
  try {
    resp = await fetch(`${authBase(cfg)}/connect/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams(params),
      signal: timeout(cfg),
    });
  } catch (err) {
    throw new Error(`Tochka token request failed: ${redact(errMessage(err))}`);
  }
  if (!resp.ok) {
    // Never echo the raw token-endpoint body — it can repeat submitted credentials.
    throw new Error(`Tochka token request failed (HTTP ${resp.status})`);
  }
  return (await resp.json()) as OAuthTokenResponse;
}

export function clientCredentialsToken(
  cfg: OAuthConfig,
  scope: string = DEFAULT_SCOPE,
): Promise<OAuthTokenResponse> {
  return requestToken(cfg, {
    grant_type: "client_credentials",
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    scope,
  });
}

export function exchangeCode(
  cfg: OAuthConfig,
  code: string,
  redirectUri: string,
): Promise<OAuthTokenResponse> {
  return requestToken(cfg, {
    grant_type: "authorization_code",
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    code,
    redirect_uri: redirectUri,
  });
}

export function refreshAccessToken(
  cfg: OAuthConfig,
  refreshToken: string,
): Promise<OAuthTokenResponse> {
  return requestToken(cfg, {
    grant_type: "refresh_token",
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    refresh_token: refreshToken,
  });
}

export async function createConsent(
  cfg: OAuthConfig,
  accessToken: string,
  permissions: string[] = DEFAULT_PERMISSIONS,
  expirationDateTime?: string,
): Promise<string> {
  const url = `${cfg.baseUrl.replace(/\/+$/, "")}/v1.0/consents`;
  const body = {
    Data: { permissions, ...(expirationDateTime ? { expirationDateTime } : {}) },
  };
  let resp: Response;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: timeout(cfg),
    });
  } catch (err) {
    throw new Error(`Tochka consent request failed: ${redact(errMessage(err))}`);
  }
  if (!resp.ok) {
    throw new Error(`Tochka consent creation failed (HTTP ${resp.status})`);
  }
  const json = (await resp.json()) as {
    Data?: { consentId?: string; Consent?: { consentId?: string } };
  };
  const consentId = json?.Data?.consentId ?? json?.Data?.Consent?.consentId;
  if (!consentId) {
    throw new Error("Tochka consent response did not contain a consentId");
  }
  return consentId;
}

export function buildAuthorizeUrl(
  cfg: OAuthConfig,
  opts: { consentId: string; state: string; redirectUri: string; scope?: string },
): string {
  const url = new URL(`${authBase(cfg)}/connect/authorize`);
  url.searchParams.set("client_id", cfg.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", opts.redirectUri);
  url.searchParams.set("scope", opts.scope ?? DEFAULT_SCOPE);
  url.searchParams.set("consent_id", opts.consentId);
  url.searchParams.set("state", opts.state);
  return url.toString();
}

function errMessage(err: unknown): string {
  if (err instanceof Error) {
    if (err.name === "TimeoutError" || err.name === "AbortError") return "request timed out";
    return err.message;
  }
  return String(err);
}
