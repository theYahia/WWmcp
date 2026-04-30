/**
 * Chapa API client (Ethiopia).
 *
 * Auth: Bearer secret key. Base URL: https://api.chapa.co/v1 (Brave-verified
 * via developer.chapa.co — accept-payments, transfer/list-banks endpoints).
 */

import { BaseHttpClient, ApiKeyStrategy, createLogger } from "@theyahia/mcp-core";

const BASE_URL = "https://api.chapa.co/v1";
const logger = createLogger("chapa-mcp");

function buildClient(): BaseHttpClient {
  const secretKey = process.env["CHAPA_SECRET_KEY"];
  if (!secretKey) {
    throw new Error(
      "CHAPA_SECRET_KEY is required. Get it at https://dashboard.chapa.co (Settings → API Keys). Use CHASECK_TEST-... for sandbox.",
    );
  }
  return new BaseHttpClient({
    baseUrl: BASE_URL,
    timeout: 15_000,
    maxRetries: 3,
    auth: new ApiKeyStrategy(secretKey),
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

export async function chapaGet(
  path: string,
  params?: Record<string, string>,
): Promise<unknown> {
  return getClient().request({ method: "GET", path, params });
}

export async function chapaPost(path: string, body: unknown): Promise<unknown> {
  return getClient().request({ method: "POST", path, body });
}
