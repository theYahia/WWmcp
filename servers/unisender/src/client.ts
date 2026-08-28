import { BaseHttpClient, NoAuthStrategy, createLogger } from "@theyahia/mcp-core";

const logger = createLogger("unisender-mcp");

// UniSender авторизуется query-параметром api_key, а не заголовком,
// поэтому NoAuthStrategy — ключ подставляется в params на каждый вызов.
const client = new BaseHttpClient({
  baseUrl: "https://api.unisender.com/ru/api",
  timeout: 15_000,
  maxRetries: 3,
  auth: new NoAuthStrategy(),
  logger,
});

function getApiKey(): string {
  const key = process.env.UNISENDER_API_KEY;
  if (!key) {
    throw new Error("Переменная окружения UNISENDER_API_KEY не задана");
  }
  return key;
}

export async function apiCall(
  method: string,
  params: Record<string, string> = {},
): Promise<unknown> {
  const query: Record<string, string> = {
    format: "json",
    api_key: getApiKey(),
  };
  for (const [k, v] of Object.entries(params)) {
    if (v) query[k] = v;
  }

  const data = (await client.get(`/${method}`, query)) as {
    error?: string;
    code?: string;
    result?: unknown;
  };

  // UniSender отдаёт HTTP 200 с телом {error, code} — для BaseHttpClient это успех,
  // прикладную ошибку разбираем сами.
  if (data?.error) {
    throw new Error(
      `UniSender ошибка: ${data.error} (код: ${data.code || "неизвестно"})`,
    );
  }
  return data?.result;
}
