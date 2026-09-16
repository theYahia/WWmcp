/**
 * Asaas API v3 client.
 *
 * Wraps @theyahia/mcp-core's BaseHttpClient (timeout, retry of GET only, SSRF and
 * path-traversal guards). Asaas authenticates with a bare `access_token: <key>`
 * header — no scheme prefix, so ApiKeyStrategy (`<header>: <prefix> <key>`) does
 * not fit; the key goes into the client's default headers instead.
 */

import { ApiError, BaseHttpClient, createLogger } from "@theyahia/mcp-core";

const BASE_URL = "https://api.asaas.com/v3";
const logger = createLogger("asaas-mcp");

// ponytail: keyed by the env value so a changed ASAAS_API_KEY rebuilds the client —
// built lazily so importing a tool module without the env set does not throw.
let cached: { key: string; client: BaseHttpClient } | null = null;

function getClient(): BaseHttpClient {
  const apiKey = process.env["ASAAS_API_KEY"];
  if (!apiKey) {
    throw new Error("Environment variable(s) ASAAS_API_KEY required. See https://docs.asaas.com/");
  }
  if (cached?.key === apiKey) return cached.client;

  cached = {
    key: apiKey,
    client: new BaseHttpClient({
      baseUrl: BASE_URL,
      timeout: 15_000,
      maxRetries: 3,
      headers: { access_token: apiKey },
      logger,
    }),
  };
  return cached.client;
}

/**
 * Request against the Asaas API. Core's ApiError keeps the upstream body in
 * `.body` only; Asaas explains 400s there (`errors[].description`), so the body
 * is folded back into the message. Core's message (incl. its "mutation not
 * retried" note), status and headers are kept for withErrorHandling.
 */
export async function asaasRequest(
  method: string,
  path: string,
  options: { body?: unknown; params?: Record<string, string> } = {},
): Promise<unknown> {
  try {
    return await getClient().request({ method, path, ...options });
  } catch (error) {
    if (error instanceof ApiError && error.status > 0) {
      throw new ApiError(
        error.status,
        `Asaas ${error.message}` + (error.body ? `\n${error.body}` : ""),
        error.body,
        error.headers,
      );
    }
    throw error;
  }
}
