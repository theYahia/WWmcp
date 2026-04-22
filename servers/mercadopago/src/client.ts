/**
 * MercadoPago API client.
 *
 * Auth: Bearer access token. Token format: APP_USR-XXXXXXXX-XXXXXX-X-XXXXXXXX
 * (production) or TEST-XXXXXXXX-XXXXXX-X-XXXXXXXX (sandbox).
 *
 * Base URL: https://api.mercadopago.com (single-host, multi-country via
 * collector_id and site_id parameters in tool payloads).
 */

import { BaseHttpClient, ApiKeyStrategy, createLogger } from "@theyahia/mcp-core";

const BASE_URL = "https://api.mercadopago.com";
const logger = createLogger("mercadopago-mcp");

function buildClient(): BaseHttpClient {
  const token = process.env["MERCADOPAGO_ACCESS_TOKEN"];
  if (!token) {
    throw new Error(
      "MERCADOPAGO_ACCESS_TOKEN is required. Get it at https://www.mercadopago.com.ar/developers/panel/credentials (Production: APP_USR-..., Test: TEST-...).",
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

let _client: BaseHttpClient | null = null;
function getClient(): BaseHttpClient {
  if (!_client) _client = buildClient();
  return _client;
}

export function resetClient(): void {
  _client = null;
}

export async function mpGet(
  path: string,
  params?: Record<string, string>,
): Promise<unknown> {
  return getClient().request({ method: "GET", path, params });
}

export async function mpPost(path: string, body: unknown): Promise<unknown> {
  return getClient().request({ method: "POST", path, body });
}

export async function mpPut(path: string, body: unknown): Promise<unknown> {
  return getClient().request({ method: "PUT", path, body });
}
