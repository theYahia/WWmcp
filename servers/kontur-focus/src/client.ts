import { BaseHttpClient, NoAuthStrategy, createLogger } from "@theyahia/mcp-core";

const logger = createLogger("kontur-focus-mcp");

const client = new BaseHttpClient({
  baseUrl: "https://focus-api.kontur.ru/api3",
  timeout: 10_000,
  maxRetries: 3,
  // ponytail: Kontur.Focus takes the key as a `?key=` query param, not a header —
  // ApiKeyStrategy is header-only, so the key is merged into params below.
  auth: new NoAuthStrategy(),
  headers: { Accept: "application/json" },
  logger,
});

export async function focusGet(
  path: string,
  params: Record<string, string> = {},
): Promise<unknown> {
  const apiKey = process.env["KONTUR_FOCUS_API_KEY"];
  if (!apiKey) {
    throw new Error(
      "KONTUR_FOCUS_API_KEY is required. Get one at https://focus.kontur.ru/",
    );
  }
  return client.get(path, { key: apiKey, ...params });
}
