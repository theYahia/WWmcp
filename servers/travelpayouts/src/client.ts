import { BaseHttpClient, ApiError, createLogger } from "@theyahia/mcp-core";

const logger = createLogger("travelpayouts-mcp");

const tpClient = new BaseHttpClient({
  baseUrl: "https://api.travelpayouts.com",
  timeout: 15_000,
  maxRetries: 3,
  // ponytail: Travelpayouts takes the token as a `?token=` query param, not a
  // header — ApiKeyStrategy is header-only, so the token is merged into params
  // in tpGet below (same shape as servers/kontur-focus).
  headers: { Accept: "application/json" },
  logger,
});

const hotellookClient = new BaseHttpClient({
  baseUrl: "https://engine.hotellook.com/api/v2",
  timeout: 15_000,
  maxRetries: 3,
  headers: { Accept: "application/json" },
  logger,
});

function getToken(): string {
  const token = process.env["TRAVELPAYOUTS_TOKEN"];
  if (!token) {
    throw new Error(
      "TRAVELPAYOUTS_TOKEN is required. Get it at https://travelpayouts.com/",
    );
  }
  return token;
}

/**
 * GET against Travelpayouts (or Hotellook). Retries 429/5xx with exponential
 * backoff via BaseHttpClient. `path` may carry its own query string.
 */
export async function tpGet(path: string, hotellook = false): Promise<unknown> {
  const [pathname, query] = path.split("?");
  const params = Object.fromEntries(new URLSearchParams(query ?? ""));
  const client = hotellook ? hotellookClient : tpClient;

  try {
    return await client.get(pathname!, { ...params, token: getToken() });
  } catch (error) {
    // Raw "HTTP 403" says nothing about the cause; name the likely fix.
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      throw new ApiError(
        error.status,
        `Travelpayouts authentication error (${error.status}): проверьте TRAVELPAYOUTS_TOKEN`,
        error.body,
        error.headers,
      );
    }
    throw error;
  }
}
