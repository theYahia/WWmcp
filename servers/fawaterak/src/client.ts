/**
 * Fawaterak API client (Egypt payment aggregator).
 *
 * Auth: Bearer API key. Base URL (Brave-verified):
 *   - Sandbox: https://staging.fawaterk.com/api/v2
 *   - Production: https://app.fawaterk.com/api/v2
 */

import { BaseHttpClient, ApiKeyStrategy, createLogger } from "@theyahia/mcp-core";

const logger = createLogger("fawaterak-mcp");

function getBaseUrl(): string {
  return process.env["FAWATERAK_SANDBOX"] === "true"
    ? "https://staging.fawaterk.com/api/v2"
    : "https://app.fawaterk.com/api/v2";
}

function buildClient(): BaseHttpClient {
  const apiKey = process.env["FAWATERAK_API_KEY"];
  if (!apiKey) {
    throw new Error(
      "FAWATERAK_API_KEY is required. Get it from your Fawaterak merchant panel (https://fawaterk.com).",
    );
  }
  return new BaseHttpClient({
    baseUrl: getBaseUrl(),
    timeout: 15_000,
    maxRetries: 3,
    auth: new ApiKeyStrategy(apiKey),
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

export async function fawaterakGet(
  path: string,
  params?: Record<string, string>,
): Promise<unknown> {
  return getClient().request({ method: "GET", path, params });
}

export async function fawaterakPost(path: string, body: unknown): Promise<unknown> {
  return getClient().request({ method: "POST", path, body });
}
