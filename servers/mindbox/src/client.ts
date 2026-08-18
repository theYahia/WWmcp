import { randomUUID } from "node:crypto";

const BASE_URL = "https://api.mindbox.ru/v3/operations";

/** Режим вызова операции Mindbox: sync — request→response, async — fire-and-forget. */
export type OperationMode = "sync" | "async";

export interface OperationOptions {
  /** Режим эндпоинта. По умолчанию "sync" (нужен, когда читаем тело ответа). */
  mode?: OperationMode;
  /** Ключ идемпотентности (UUID v4). Генерируется автоматически и переиспользуется при повторах. */
  transactionId?: string;
}

export interface ClientOptions {
  /** Сколько раз повторять при 429/5xx/таймауте/сетевой ошибке. По умолчанию 3 (env MINDBOX_MAX_RETRIES). */
  maxRetries?: number;
  /** Базовая задержка backoff в мс. По умолчанию 500 (env MINDBOX_RETRY_BASE_MS). */
  retryBaseMs?: number;
  /** Таймаут одной попытки в мс. По умолчанию 15000 (env MINDBOX_TIMEOUT_MS). */
  timeoutMs?: number;
}

const RETRYABLE_HTTP = new Set([429, 500, 502, 503, 504]);

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export class MindboxClient {
  private secretKey: string;
  private endpointId: string;
  private maxRetries: number;
  private retryBaseMs: number;
  private timeoutMs: number;

  constructor(secretKey?: string, endpointId?: string, options: ClientOptions = {}) {
    this.secretKey =
      secretKey ?? process.env.MINDBOX_API_KEY ?? process.env.MINDBOX_SECRET_KEY ?? "";
    this.endpointId = endpointId ?? process.env.MINDBOX_ENDPOINT_ID ?? "";
    if (!this.secretKey) {
      throw new Error(
        "Переменная окружения MINDBOX_API_KEY (или MINDBOX_SECRET_KEY) обязательна. " +
          "Получите ключ в личном кабинете Mindbox.",
      );
    }
    if (!this.endpointId) {
      throw new Error(
        "Переменная окружения MINDBOX_ENDPOINT_ID обязательна. " + "Укажите ID эндпоинта Mindbox.",
      );
    }
    this.maxRetries = options.maxRetries ?? intEnv("MINDBOX_MAX_RETRIES", 3);
    this.retryBaseMs = options.retryBaseMs ?? intEnv("MINDBOX_RETRY_BASE_MS", 500);
    this.timeoutMs = options.timeoutMs ?? intEnv("MINDBOX_TIMEOUT_MS", 15_000);
  }

  /**
   * Вызвать операцию Mindbox.
   *
   * URL формируется как POST {BASE_URL}/{mode}?endpointId=…&operation=…&transactionId=…
   * Сегмент sync/async обязателен — у Mindbox нет голого /v3/operations.
   * Повторы (429/5xx/таймаут/сеть) идемпотентны за счёт одного transactionId на все попытки.
   */
  async operation(
    operationName: string,
    body: Record<string, unknown>,
    opts: OperationOptions = {},
  ): Promise<unknown> {
    const mode: OperationMode = opts.mode ?? "sync";
    const transactionId = opts.transactionId ?? randomUUID();
    const params = new URLSearchParams({
      endpointId: this.endpointId,
      operation: operationName,
      transactionId,
    });
    const fullUrl = `${BASE_URL}/${mode}?${params.toString()}`;
    const payload = JSON.stringify(body);

    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(fullUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Mindbox secretKey="${this.secretKey}"`,
            Accept: "application/json",
          },
          body: payload,
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (!response.ok) {
          if (RETRYABLE_HTTP.has(response.status) && attempt < this.maxRetries) {
            await response.text().catch(() => undefined); // drain тело перед повтором
            await this.backoff(attempt, response.headers.get("retry-after"));
            continue;
          }
          const text = await response.text();
          throw new Error(`Mindbox HTTP ${response.status}: ${text}`);
        }

        const data = await response.json();

        if (
          data &&
          typeof data === "object" &&
          (data as Record<string, unknown>).status === "InternalServerError"
        ) {
          throw new Error(
            `Mindbox: ${JSON.stringify((data as Record<string, unknown>).errorMessage)}`,
          );
        }

        return data;
      } catch (error) {
        clearTimeout(timer);

        if (error instanceof DOMException && error.name === "AbortError") {
          lastError = new Error(
            `Mindbox: таймаут запроса (${Math.round(this.timeoutMs / 1000)} секунд). Попробуйте позже.`,
          );
        } else if (error instanceof TypeError) {
          // Сетевой сбой fetch (DNS/соединение) — обычно транзиентный.
          lastError = error;
        } else {
          // HTTP/прикладная ошибка — не повторяем.
          throw error;
        }

        if (attempt < this.maxRetries) {
          await this.backoff(attempt, null);
          continue;
        }
        throw lastError;
      }
    }

    throw lastError ?? new Error("Mindbox: запрос не удался после повторных попыток.");
  }

  /** Экспоненциальный backoff с джиттером; уважает Retry-After (в секундах). */
  private async backoff(attempt: number, retryAfter: string | null): Promise<void> {
    let delay = this.retryBaseMs * 2 ** attempt;
    if (retryAfter) {
      const seconds = Number(retryAfter);
      if (Number.isFinite(seconds) && seconds >= 0) delay = seconds * 1000;
    }
    const jitter = Math.floor(Math.random() * Math.max(1, this.retryBaseMs / 2));
    const total = Math.min(delay + jitter, 30_000);
    if (total > 0) await new Promise((resolve) => setTimeout(resolve, total));
  }
}

let cached: MindboxClient | null = null;

/**
 * Ленивый мемоизированный клиент.
 * Инструменты вызывают getClient() ВНУТРИ хендлера, а не на верхнем уровне модуля,
 * чтобы сервер стартовал и отдавал список инструментов без credentials
 * (tool-discovery, Smithery scan, `npx` без env) и падал понятной ошибкой только при реальном вызове.
 */
export function getClient(): MindboxClient {
  if (!cached) cached = new MindboxClient();
  return cached;
}

/** Сбросить кэш клиента (для тестов). */
export function resetClient(): void {
  cached = null;
}
