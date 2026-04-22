/**
 * VK Ads API client.
 *
 * Uses BaseHttpClient + ApiKeyStrategy from @theyahia/mcp-core.
 * Re-exports apiGet/apiPost as functional API so tools/* keep their signatures
 * unchanged across the v1 → v2 migration.
 */

import { BaseHttpClient, ApiKeyStrategy, createLogger } from "@theyahia/mcp-core";

const BASE_URL = "https://ads.vk.com/api/v2";
const logger = createLogger("vk-ads-mcp");

function createVkAdsClient(): BaseHttpClient {
  const token = process.env["VK_ADS_TOKEN"];
  if (!token) {
    throw new Error(
      "VK_ADS_TOKEN is required. Get it from your VK Ads account: https://ads.vk.com (Tools → API).",
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
  if (!_client) _client = createVkAdsClient();
  return _client;
}

export function resetClient(): void {
  _client = null;
}

export async function apiGet(
  path: string,
  params: Record<string, string> = {},
): Promise<unknown> {
  return getClient().request({ method: "GET", path, params });
}

export async function apiPost(
  path: string,
  body: Record<string, unknown> = {},
): Promise<unknown> {
  return getClient().request({ method: "POST", path, body });
}
