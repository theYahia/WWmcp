import { BaseHttpClient, ApiKeyStrategy, createLogger } from "@theyahia/mcp-core";

const logger = createLogger("CHANGEME-mcp");

function createClient(): BaseHttpClient {
  const apiKey = process.env.CHANGEME_API_KEY;
  if (!apiKey) {
    throw new Error(
      "CHANGEME_API_KEY is required. Get it at https://example.com/settings",
    );
  }

  return new BaseHttpClient({
    baseUrl: "https://api.example.com/v1",
    timeout: 15_000,
    maxRetries: 3,
    auth: new ApiKeyStrategy(apiKey),
    logger,
  });
}

/** Lazy singleton — created on first use */
let _client: BaseHttpClient | null = null;
export function getClient(): BaseHttpClient {
  if (!_client) _client = createClient();
  return _client;
}
