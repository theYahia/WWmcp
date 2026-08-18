/**
 * Kaspi.kz Shop API v2 client.
 *
 * Wraps @theyahia/mcp-core's BaseHttpClient (retry + timeout + backoff + SSRF guard).
 * Auth is a plain `Authorization: Bearer <key>` header — same wire format v1 sent,
 * which is exactly what core's ApiKeyStrategy produces by default.
 */

import {
  ApiKeyStrategy,
  BaseHttpClient,
  createLogger,
} from "@theyahia/mcp-core";

const BASE_URL = "https://kaspi.kz/shop/api/v2";
const logger = createLogger("kaspi-mcp");

// ponytail: keyed by the env value so a changed KASPI_API_KEY rebuilds the client
// (ApiKeyStrategy captures the key at construction) — no invalidation API needed.
let cached: { key: string; client: BaseHttpClient } | null = null;

function getClient(): BaseHttpClient {
  const apiKey = process.env["KASPI_API_KEY"];
  if (!apiKey) {
    throw new Error(
      "Переменная окружения KASPI_API_KEY обязательна. " +
        "Получите ключ в кабинете продавца Kaspi.kz.",
    );
  }
  if (cached?.key === apiKey) return cached.client;

  cached = {
    key: apiKey,
    client: new BaseHttpClient({
      baseUrl: BASE_URL,
      timeout: 15_000,
      maxRetries: 3,
      auth: new ApiKeyStrategy(apiKey),
      // Kaspi speaks JSON:API — both Content-Type and Accept must be vnd.api+json.
      headers: {
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      logger,
    }),
  };
  return cached.client;
}

/** GET against the Kaspi Shop API. Env var is read lazily, on first call. */
export async function kaspiGet(
  path: string,
  params?: Record<string, string>,
): Promise<unknown> {
  return getClient().get(path, params);
}
