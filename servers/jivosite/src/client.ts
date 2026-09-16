/**
 * JivoSite API client on top of @theyahia/mcp-core's BaseHttpClient
 * (retry + timeout + backoff + SSRF/traversal guard).
 *
 * Auth is `Authorization: Bearer <JIVOSITE_TOKEN>` — the same wire format the
 * standalone package sent, which is exactly what core's ApiKeyStrategy produces.
 *
 * Behaviour change vs the standalone 1.1.0 client: POST is no longer retried on
 * 429/5xx/timeout. A repeated send_message / create_contact / create_webhook
 * would duplicate the object; core refuses to retry mutating requests.
 */

import {
  ApiKeyStrategy,
  BaseHttpClient,
  createLogger,
} from "@theyahia/mcp-core";

const DEFAULT_BASE_URL = "https://api.jivosite.com/v1";
const logger = createLogger("jivosite-mcp");

// ponytail: keyed by token + base URL so a changed env rebuilds the client
// (ApiKeyStrategy captures the token at construction) — no invalidation API needed.
let cached: { key: string; client: BaseHttpClient } | null = null;

function getClient(): BaseHttpClient {
  const token = process.env.JIVOSITE_TOKEN;
  if (!token) throw new Error("JIVOSITE_TOKEN не задан");
  const baseUrl = process.env.JIVOSITE_BASE_URL || DEFAULT_BASE_URL;
  const key = `${token}\n${baseUrl}`;
  if (cached?.key === key) return cached.client;

  cached = {
    key,
    client: new BaseHttpClient({
      baseUrl,
      timeout: 10_000,
      maxRetries: 3,
      auth: new ApiKeyStrategy(token),
      logger,
    }),
  };
  return cached.client;
}

// Tool modules pass paths without a leading slash ("chats", "webhooks/123");
// BaseHttpClient concatenates `${baseUrl}${path}`.
const withSlash = (path: string) => (path.startsWith("/") ? path : `/${path}`);

export async function jivoGet(path: string, params: Record<string, string> = {}): Promise<unknown> {
  return getClient().get(withSlash(path), Object.keys(params).length ? params : undefined);
}

export async function jivoPost(path: string, body: Record<string, unknown> = {}): Promise<unknown> {
  return getClient().post(withSlash(path), body);
}

export async function jivoDelete(path: string): Promise<unknown> {
  // Empty 2xx body → core returns null; the standalone client reported { success: true }.
  return (await getClient().delete(withSlash(path))) ?? { success: true };
}
