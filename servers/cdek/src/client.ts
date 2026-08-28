/**
 * CDEK API client — uses BaseHttpClient + OAuthStrategy from mcp-core.
 * OAuth2 token refresh and concurrent dedup handled by OAuthStrategy automatically.
 */

import { BaseHttpClient, OAuthStrategy, createLogger } from "@theyahia/mcp-core";

const logger = createLogger("cdek-mcp");

function createCdekClient(): BaseHttpClient {
  const clientId = process.env.CDEK_CLIENT_ID ?? "";
  const clientSecret = process.env.CDEK_CLIENT_SECRET ?? "";

  if (!clientId || !clientSecret) {
    throw new Error(
      "Переменные окружения CDEK_CLIENT_ID и CDEK_CLIENT_SECRET обязательны. " +
      "Получите их в личном кабинете СДЭК: Интеграция → Ключи API"
    );
  }

  const sandbox = process.env.CDEK_SANDBOX === "true";
  const baseUrl = sandbox
    ? "https://api.edu.cdek.ru/v2"
    : "https://api.cdek.ru/v2";

  const tokenUrl = sandbox
    ? "https://api.edu.cdek.ru/v2/oauth/token"
    : "https://api.cdek.ru/v2/oauth/token";

  if (sandbox) {
    logger.warn("Using sandbox mode (CDEK_SANDBOX=true)");
  }

  return new BaseHttpClient({
    baseUrl,
    timeout: 15_000,
    maxRetries: 3,
    logger,
    auth: new OAuthStrategy({
      tokenUrl,
      clientId,
      clientSecret,
    }),
  });
}

/** Lazy singleton — created on first use, not at import time */
let _client: BaseHttpClient | null = null;

export function getClient(): BaseHttpClient {
  if (!_client) _client = createCdekClient();
  return _client;
}
