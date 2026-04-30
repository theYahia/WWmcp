import { BaseHttpClient, NoAuthStrategy, createLogger } from "@theyahia/mcp-core";

const logger = createLogger("bitrix24-mcp");

function getWebhookUrl(): string {
  const url = process.env.BITRIX24_WEBHOOK_URL;
  if (!url) throw new Error("BITRIX24_WEBHOOK_URL is not set");
  return url.endsWith("/") ? url : url + "/";
}

const client = new BaseHttpClient({
  baseUrl: getWebhookUrl(),
  timeout: 15_000,
  maxRetries: 3,
  auth: new NoAuthStrategy(),
  logger,
});

export async function bitrix24Call(method: string, params?: Record<string, unknown>): Promise<unknown> {
  return client.post(`${method}.json`, params);
}
