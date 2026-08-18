/**
 * MTS Exolve API client (Russia).
 *
 * Auth: Bearer token. Base URL: https://api.exolve.ru/v1
 *
 * Retry/timeout/backoff come from @theyahia/mcp-core BaseHttpClient — the
 * hand-rolled fetch loop from the standalone repo was dropped in favour of it.
 */

import { BaseHttpClient, ApiKeyStrategy, createLogger } from "@theyahia/mcp-core";

const BASE_URL = "https://api.exolve.ru/v1";

const logger = createLogger("mts-exolve-mcp");

// ponytail: lazy singleton so a missing token fails at tool-call time, not at
// import time — the server must still start and list tools without credentials.
let _client: BaseHttpClient | null = null;

function getClient(): BaseHttpClient {
  if (_client) return _client;

  const token = process.env["MTS_EXOLVE_TOKEN"];
  if (!token) {
    throw new Error(
      "MTS_EXOLVE_TOKEN не задан. Получите токен в личном кабинете MTS Exolve: https://exolve.ru",
    );
  }

  _client = new BaseHttpClient({
    baseUrl: BASE_URL,
    timeout: 10_000,
    maxRetries: 3,
    auth: new ApiKeyStrategy(token),
    logger,
  });
  return _client;
}

/** Test seam: drops the memoized client so a changed env var takes effect. */
export function resetClient(): void {
  _client = null;
}

export async function exolvePost(
  path: string,
  body: Record<string, unknown> = {},
): Promise<unknown> {
  return getClient().post(path, body);
}

export async function exolveGet(path: string): Promise<unknown> {
  return getClient().get(path);
}
