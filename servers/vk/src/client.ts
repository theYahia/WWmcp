import { ApiError, BaseHttpClient, NoAuthStrategy, createLogger } from "@theyahia/mcp-core";

const BASE_URL = "https://api.vk.com/method";
const TIMEOUT = 10_000;
const API_VERSION = "5.199";

const NOT_RETRIED =
  "Повтор не выполнен автоматически: запрос мог дойти до VK. " +
  "Проверьте стену или диалог, прежде чем повторять.";

const logger = createLogger("vk-mcp");

// Конструктор env не читает — токен берётся при каждом вызове, импорт без VK_ACCESS_TOKEN не падает.
const client = new BaseHttpClient({
  baseUrl: BASE_URL,
  timeout: TIMEOUT,
  maxRetries: 3,
  // VK принимает access_token параметром запроса, а ApiKeyStrategy ядра — только заголовок.
  auth: new NoAuthStrategy(),
  headers: { Accept: "application/json" },
  logger,
});

function authParams(params: Record<string, string>): Record<string, string> {
  const token = process.env["VK_ACCESS_TOKEN"];
  if (!token) throw new Error("VK_ACCESS_TOKEN не задан");
  return { ...params, access_token: token, v: API_VERSION };
}

/** VK отдаёт ошибку метода с HTTP 200 и полем `error`. */
function unwrap(data: unknown): unknown {
  const d = data as {
    response?: unknown;
    error?: { error_msg: string; error_code: number };
  };
  if (d?.error) {
    throw new Error(`VK API ошибка ${d.error.error_code}: ${d.error.error_msg}`);
  }
  return d?.response;
}

/** GET для чтения: ретраи, таймаут и backoff — из ядра. */
export async function vkGet(
  method: string,
  params: Record<string, string> = {},
): Promise<unknown> {
  return unwrap(await client.get(`/${method}`, authParams(params)));
}

/**
 * POST для записи (wall.post, messages.send).
 *
 * ponytail: ядро шлёт тело только JSON, а методы VK ждут форму — поэтому свой fetch.
 * Одна попытка: wall.post не идемпотентен, повтор после таймаута или 5xx публикует
 * пост дважды. Перевести на BaseHttpClient, когда в ядре появится form-body.
 */
export async function vkPost(
  method: string,
  params: Record<string, string> = {},
): Promise<unknown> {
  const body = new URLSearchParams(authParams(params)).toString();
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(TIMEOUT),
    });
  } catch (error) {
    const reason =
      error instanceof DOMException && error.name === "TimeoutError"
        ? `таймаут ${TIMEOUT / 1000}с`
        : error instanceof Error
          ? error.message
          : String(error);
    logger.warn("VK POST failed", { method, reason });
    throw new ApiError(0, `Сбой запроса к VK (${reason}). ${NOT_RETRIED}`);
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `VK HTTP ${response.status}: ${response.statusText}` +
        (response.status === 429 || response.status >= 500 ? `\n${NOT_RETRIED}` : ""),
    );
  }
  return unwrap(await response.json());
}
