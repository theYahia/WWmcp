import { BaseHttpClient, NoAuthStrategy, createLogger } from "@theyahia/mcp-core";

const logger = createLogger("getcourse-mcp");

function createClient(): { baseClient: BaseHttpClient; apiKey: string } {
  const domain = process.env.GETCOURSE_DOMAIN ?? "";
  const apiKey = process.env.GETCOURSE_API_KEY ?? "";

  if (!domain || !apiKey) {
    throw new Error(
      "Переменные окружения GETCOURSE_DOMAIN и GETCOURSE_API_KEY обязательны. " +
      "GETCOURSE_DOMAIN -- домен аккаунта (например, myschool.getcourse.ru). " +
      "GETCOURSE_API_KEY -- секретный ключ из настроек аккаунта."
    );
  }

  const baseClient = new BaseHttpClient({
    baseUrl: `https://${domain}/pl/api`,
    timeout: 15_000,
    maxRetries: 1,
    auth: new NoAuthStrategy(),
    logger,
  });

  return { baseClient, apiKey };
}

let _state: { baseClient: BaseHttpClient; apiKey: string } | null = null;

function getState(): { baseClient: BaseHttpClient; apiKey: string } {
  if (!_state) _state = createClient();
  return _state;
}

export async function gcGet(path: string, params?: Record<string, string>): Promise<unknown> {
  const { baseClient, apiKey } = getState();
  const allParams = { ...params, key: apiKey };
  const query = "?" + new URLSearchParams(allParams).toString();
  return baseClient.get(`${path}${query}`);
}

export async function gcPost(path: string, body?: Record<string, unknown>): Promise<unknown> {
  const { baseClient, apiKey } = getState();
  return baseClient.post(`${path}?key=${encodeURIComponent(apiKey)}`, body);
}
