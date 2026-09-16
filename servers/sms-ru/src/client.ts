import { BaseHttpClient, NoAuthStrategy, createLogger } from "@theyahia/mcp-core";

const logger = createLogger("sms-ru-mcp");

// Отправка SMS идёт GET-запросом, а ядро повторяет GET на 5xx/429/таймаут.
// Повтор отправки = второе платное SMS получателю, поэтому для записи — одна попытка.
const WRITE_PATHS = new Set(["sms/send"]);

const clients = new Map<number, BaseHttpClient>();

// ponytail: ленивый клиент — модуль импортируется без SMS_RU_API_ID (тесты, smoke).
// Ключ в клиенте не хранится (NoAuthStrategy), поэтому кэш по ключу не нужен.
function getClient(maxRetries: number): BaseHttpClient {
  let client = clients.get(maxRetries);
  if (!client) {
    client = new BaseHttpClient({
      baseUrl: "https://sms.ru",
      timeout: 10_000,
      maxRetries,
      // SMS.RU принимает ключ query-параметром api_id, а ApiKeyStrategy ядра — только заголовок.
      auth: new NoAuthStrategy(),
      headers: { Accept: "application/json" },
      logger,
    });
    clients.set(maxRetries, client);
  }
  return client;
}

export async function smsRuGet(path: string, params: Record<string, string> = {}): Promise<unknown> {
  const apiId = process.env["SMS_RU_API_ID"];
  if (!apiId) throw new Error("SMS_RU_API_ID не задан");

  const retries = WRITE_PATHS.has(path) ? 1 : 3;
  return getClient(retries).get(`/${path}`, { ...params, api_id: apiId, json: "1" });
}
