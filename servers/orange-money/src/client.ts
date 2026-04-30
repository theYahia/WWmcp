/**
 * Orange Money WebPay client (Pan-Francophone West/Central Africa).
 *
 * Auth: OAuth2 Client Credentials with Basic Authorization header
 * (Brave-verified: Orange Developer requires Basic header + body containing
 * only `grant_type=client_credentials` — NO client_id/secret in body, that
 * triggers HTTP 400 "Duplicate credentials").
 *
 * Token endpoint: https://api.orange.com/oauth/v3/token (global)
 * Per-country base: https://api.orange.com/orange-money-webpay/<country>/v1
 *
 * Country selected via ORANGE_MONEY_COUNTRY env (sn, ci, ml, cm, bf, etc.).
 */

import {
  BaseHttpClient,
  createLogger,
  type AuthStrategy,
} from "@theyahia/mcp-core";

const TOKEN_URL = "https://api.orange.com/oauth/v3/token";
const logger = createLogger("orange-money-mcp");

function getCountry(): string {
  const country = process.env["ORANGE_MONEY_COUNTRY"];
  if (!country) {
    throw new Error(
      "ORANGE_MONEY_COUNTRY is required (e.g. 'sn' for Senegal, 'ci' for Côte d'Ivoire, 'ml' for Mali, 'cm' for Cameroon).",
    );
  }
  return country.toLowerCase();
}

function getBaseUrl(): string {
  return `https://api.orange.com/orange-money-webpay/${getCountry()}/v1`;
}

/**
 * Orange Developer OAuth2 strategy.
 *
 * Differences from mcp-core's stock OAuthStrategy:
 *   - client_id:client_secret sent as Basic header (Orange forbids body credentials)
 *   - body contains only `grant_type=client_credentials`
 *   - Accept: application/json header is mandatory (else HTTP 406)
 */
class OrangeMoneyAuthStrategy implements AuthStrategy {
  readonly type = "orange_oauth2_basic";
  private token: string | null = null;
  private expiresAt = 0;

  invalidate(): void {
    this.token = null;
    this.expiresAt = 0;
  }

  private async refresh(): Promise<string> {
    const clientId = process.env["ORANGE_MONEY_CLIENT_ID"];
    const clientSecret = process.env["ORANGE_MONEY_CLIENT_SECRET"];
    if (!clientId || !clientSecret) {
      throw new Error(
        "ORANGE_MONEY_CLIENT_ID and ORANGE_MONEY_CLIENT_SECRET are required (get them at developer.orange.com → MyApps).",
      );
    }
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Orange Money OAuth token error (HTTP ${response.status}): ${text}`);
    }

    const data = (await response.json()) as {
      access_token?: string;
      expires_in?: number;
      token_type?: string;
    };
    if (!data.access_token) {
      throw new Error("Orange Money OAuth: no access_token in response");
    }
    this.token = data.access_token;
    this.expiresAt = Date.now() + (data.expires_in ?? 3600) * 1000;
    return this.token;
  }

  private async getToken(): Promise<string> {
    const buffer = 60_000; // refresh 1 min before expiry
    if (this.token && Date.now() < this.expiresAt - buffer) return this.token;
    return this.refresh();
  }

  async authenticate(req: RequestInit): Promise<RequestInit> {
    const token = await this.getToken();
    const headers = new Headers(req.headers);
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("Accept", "application/json");
    return { ...req, headers };
  }
}

const authStrategy = new OrangeMoneyAuthStrategy();

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

export async function omGet(
  path: string,
  params?: Record<string, string>,
): Promise<unknown> {
  return getClient().request({ method: "GET", path, params });
}

export async function omPost(path: string, body: unknown): Promise<unknown> {
  return getClient().request({ method: "POST", path, body });
}
