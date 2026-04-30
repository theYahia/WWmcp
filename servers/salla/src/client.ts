/**
 * Salla API client.
 *
 * Wraps @theyahia/mcp-core's BaseHttpClient + ApiKeyStrategy. Exposes the same
 * `SallaClient.request(method, path, body?)` shape that tools/* expect, so the
 * v1 → v2 migration touches only this file.
 *
 * Uses lazy initialization — the SALLA_ACCESS_TOKEN env var is only read on
 * the first request, so module-level `new SallaClient()` does not throw at
 * import time (important for tests).
 */

import { BaseHttpClient, ApiKeyStrategy, createLogger } from "@theyahia/mcp-core";

const BASE_URL = "https://api.salla.dev/admin/v2";
const logger = createLogger("salla-mcp");

function buildClient(): BaseHttpClient {
  const token = process.env["SALLA_ACCESS_TOKEN"];
  if (!token) {
    throw new Error(
      "SALLA_ACCESS_TOKEN is required. Get it from https://salla.partners/ (Apps → OAuth credentials).",
    );
  }
  return new BaseHttpClient({
    baseUrl: BASE_URL,
    timeout: 15_000,
    maxRetries: 3,
    auth: new ApiKeyStrategy(token),
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
