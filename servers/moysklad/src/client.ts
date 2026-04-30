/**
 * MoySklad API client.
 *
 * Uses RateLimitedClient (token bucket: 45 req / 3s) and DualAuthStrategy
 * (Bearer token or Basic login/password fallback) from @theyahia/mcp-core.
 */

import { RateLimitedClient, DualAuthStrategy, createLogger } from "@theyahia/mcp-core";

const logger = createLogger("moysklad-mcp");

const client = new RateLimitedClient({
  baseUrl: "https://api.moysklad.ru/api/remap/1.2",
  timeout: 15_000,
  maxRetries: 3,
  bucketMax: 45,
  bucketRefillMs: 3000,
  auth: new DualAuthStrategy({
    token: process.env.MOYSKLAD_TOKEN,
    login: process.env.MOYSKLAD_LOGIN,
    password: process.env.MOYSKLAD_PASSWORD,
  }),
  logger,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
    Accept: "application/json;charset=utf-8",
  },
});

export async function moyskladGet(path: string): Promise<unknown> {
  return client.get(path);
}

export async function moyskladPost(path: string, body: unknown): Promise<unknown> {
  return client.post(path, body);
}

export async function moyskladPut(path: string, body: unknown): Promise<unknown> {
  return client.put(path, body);
}
