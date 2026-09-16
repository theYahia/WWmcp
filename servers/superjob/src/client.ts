/**
 * SuperJob API 2.0 client.
 *
 * Wraps @theyahia/mcp-core's BaseHttpClient (retry + timeout + backoff + SSRF guard).
 * Wire format kept from the published 1.1.x: the secret key travels in
 * `X-Api-App-Id`, the optional app id in `X-Api-App-Secret`.
 */

import { BaseHttpClient, createLogger } from "@theyahia/mcp-core";

const BASE_URL = "https://api.superjob.ru/2.0";
const logger = createLogger("superjob-mcp");

// ponytail: keyed by the env values so a changed key rebuilds the client —
// no invalidation API needed. Static headers instead of ApiKeyStrategy:
// the key goes bare (no "Bearer") into a custom header.
let cached: { key: string; client: BaseHttpClient } | null = null;

function getClient(): BaseHttpClient {
  // Support both old SUPERJOB_API_KEY and new SUPERJOB_SECRET_KEY + SUPERJOB_APP_ID
  const secretKey =
    process.env["SUPERJOB_SECRET_KEY"] ?? process.env["SUPERJOB_API_KEY"];
  const appId = process.env["SUPERJOB_APP_ID"];

  if (!secretKey) {
    throw new Error(
      "SUPERJOB_SECRET_KEY обязателен (или SUPERJOB_API_KEY). Получите на api.superjob.ru",
    );
  }

  const key = `${secretKey}\n${appId ?? ""}`;
  if (cached?.key === key) return cached.client;

  const headers: Record<string, string> = {
    "X-Api-App-Id": secretKey,
    Accept: "application/json",
  };
  if (appId) {
    headers["X-Api-App-Secret"] = appId;
  }

  cached = {
    key,
    client: new BaseHttpClient({
      baseUrl: BASE_URL,
      timeout: 10_000,
      maxRetries: 3,
      headers,
      logger,
    }),
  };
  return cached.client;
}

/** GET against the SuperJob API. `path` may carry its own query string. */
export async function sjGet(path: string): Promise<unknown> {
  return getClient().get(path);
}
