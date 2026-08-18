import { BaseHttpClient, NoAuthStrategy, createLogger } from "@theyahia/mcp-core";

const BASE_URL = "https://api.dellin.ru/v3";

const logger = createLogger("delovye-linii-mcp");

/**
 * Клиент API Деловых Линий поверх BaseHttpClient (ретраи, таймаут, SSRF-guard).
 *
 * ponytail: своей AuthStrategy нет — Dellin ждёт ключ полем `appkey` в теле
 * запроса, а все стратегии ядра пишут в заголовки. Поэтому auth = NoAuthStrategy,
 * а ключ подмешивается в body здесь. Если в ядре появится BodyKeyStrategy —
 * заменить на неё.
 */
export class DellinClient extends BaseHttpClient {
  private readonly apiKey: string;

  constructor(apiKey?: string, baseUrl?: string) {
    const key = apiKey ?? process.env.DELLIN_API_KEY ?? "";
    if (!key) {
      throw new Error(
        "Переменная окружения DELLIN_API_KEY обязательна. " +
          "Получите ключ API в личном кабинете Деловых Линий: https://dev.dellin.ru/",
      );
    }
    super({
      baseUrl: baseUrl ?? BASE_URL,
      timeout: 15_000,
      maxRetries: 3,
      auth: new NoAuthStrategy(),
      logger,
    });
    this.apiKey = key;
  }

  override async post(path: string, body?: unknown): Promise<unknown> {
    const payload = {
      ...(body as Record<string, unknown> | undefined),
      appkey: this.apiKey,
    };
    const data = await super.post(`${path}.json`, payload);

    // Dellin отдаёт HTTP 200 с массивом errors — разворачиваем в исключение,
    // иначе ошибка молча уедет в ответ инструмента как «нет данных».
    if (data && typeof data === "object" && "errors" in data) {
      const errData = data as { errors?: Array<{ title: string; detail?: string }> };
      if (errData.errors && errData.errors.length > 0) {
        const msgs = errData.errors
          .map((e) => (e.detail ? `${e.title}: ${e.detail}` : e.title))
          .join("; ");
        throw new Error(`Деловые Линии: ${msgs}`);
      }
    }

    return data;
  }
}
