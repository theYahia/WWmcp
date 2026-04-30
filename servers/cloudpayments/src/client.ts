import { BaseHttpClient, BasicAuthStrategy, createLogger } from "@theyahia/mcp-core";
import type { CloudPaymentsResponse } from "./types.js";

const logger = createLogger("cloudpayments-mcp");

function createClient(): BaseHttpClient {
  const publicId = process.env.CLOUDPAYMENTS_PUBLIC_ID ?? "";
  const apiSecret = process.env.CLOUDPAYMENTS_API_SECRET ?? "";

  if (!publicId || !apiSecret) {
    throw new Error(
      "Переменные окружения CLOUDPAYMENTS_PUBLIC_ID и CLOUDPAYMENTS_API_SECRET обязательны. " +
      "Получите их в личном кабинете CloudPayments: Настройки сайта -> API."
    );
  }

  return new BaseHttpClient({
    baseUrl: "https://api.cloudpayments.ru",
    timeout: 10_000,
    maxRetries: 3,
    auth: new BasicAuthStrategy(publicId, apiSecret),
    logger,
  });
}

let _client: BaseHttpClient | null = null;

function getClient(): BaseHttpClient {
  if (!_client) _client = createClient();
  return _client;
}

export async function cpPost<T = unknown>(path: string, body?: Record<string, unknown>): Promise<CloudPaymentsResponse<T>> {
  return (await getClient().post(path, body)) as CloudPaymentsResponse<T>;
}
