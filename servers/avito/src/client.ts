/**
 * Avito API client.
 *
 * Wraps @theyahia/mcp-core's BaseHttpClient with OAuthStrategy
 * (`grant_type=client_credentials`). The strategy auto-refreshes the
 * access token against `https://api.avito.ru/token/` whenever the cached
 * token is within `expiryBuffer` of expiry (Avito tokens last 24h).
 *
 * Auth env vars:
 *   - AVITO_CLIENT_ID — OAuth app client_id from Avito API office
 *   - AVITO_CLIENT_SECRET — OAuth app client_secret
 *
 * Optional:
 *   - AVITO_USER_ID — your Avito numeric user id (account number). Most
 *     endpoints embed it in the path (e.g. /core/v1/accounts/{user_id}/items).
 *     If a tool call omits user_id, the client falls back to this env var.
 *
 * Lazy init — env vars are only read on the first request, so module-level
 * `new AvitoClient()` does not throw at import time.
 */

import {
  BaseHttpClient,
  OAuthStrategy,
  createLogger,
  type AuthStrategy,
} from "@theyahia/mcp-core";

const API_BASE_URL = "https://api.avito.ru";
const OAUTH_TOKEN_URL = "https://api.avito.ru/token/";
const logger = createLogger("avito-mcp");

function buildAuth(): AuthStrategy {
  const clientId = process.env["AVITO_CLIENT_ID"];
  const clientSecret = process.env["AVITO_CLIENT_SECRET"];

  if (!clientId || !clientSecret) {
    throw new Error(
      "Avito auth not configured. Provide AVITO_CLIENT_ID + AVITO_CLIENT_SECRET. " +
        "Get OAuth credentials at https://developers.avito.ru/ (API office → Create app, " +
        "grant_type=client_credentials).",
    );
  }

  return new OAuthStrategy({
    tokenUrl: OAUTH_TOKEN_URL,
    clientId,
    clientSecret,
  });
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

export class AvitoClient {
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

  /**
   * Resolve user_id from explicit param or AVITO_USER_ID env. Throws if
   * neither is set with a helpful message.
   */
  resolveUserId(explicit?: number | string): string {
    if (explicit !== undefined && explicit !== null && explicit !== "") {
      return String(explicit);
    }
    const fromEnv = process.env["AVITO_USER_ID"];
    if (fromEnv) return fromEnv;
    throw new Error(
      "user_id is required. Pass it as a tool argument or set AVITO_USER_ID env. " +
        "Find your Avito user_id in https://developers.avito.ru/ profile or via the " +
        "GET /core/v1/accounts/self endpoint.",
    );
  }
}
