/**
 * SendPulse REST API client.
 *
 * Транспорт — BaseHttpClient ядра: таймаут, повтор только идемпотентных запросов,
 * защита от SSRF и `..` в пути, сброс токена и повтор на 401/403.
 *
 * Авторизация — своя стратегия, а не OAuthStrategy ядра: ядро шлёт запрос токена
 * как form-urlencoded, а опубликованный 1.x всегда слал JSON на /oauth/access_token.
 * Формат провода сохранён, а не угадан заново. Кэш токена с запасом 60 с — как в 1.x,
 * single-flight добавлен: параллельные вызовы инструментов делят один запрос токена.
 */

import {
  ApiError,
  BaseHttpClient,
  createLogger,
  type AuthStrategy,
} from "@theyahia/mcp-core";
import type { SendPulseTokenResponse } from "./types.js";

const BASE_URL = "https://api.sendpulse.com";
const TIMEOUT = 15_000;

const logger = createLogger("sendpulse-mcp");

class SendPulseAuthStrategy implements AuthStrategy {
  readonly type = "sendpulse-oauth";
  private token: string | null = null;
  private expiresAt = 0;
  private refreshPromise: Promise<string> | null = null;

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
  ) {}

  invalidate(): void {
    this.token = null;
    this.expiresAt = 0;
  }

  async authenticate(req: RequestInit): Promise<RequestInit> {
    const headers = new Headers(req.headers);
    headers.set("Authorization", `Bearer ${await this.getToken()}`);
    return { ...req, headers };
  }

  private getToken(): Promise<string> {
    if (this.token && Date.now() < this.expiresAt) {
      return Promise.resolve(this.token);
    }
    this.refreshPromise ??= this.refresh().finally(() => {
      this.refreshPromise = null;
    });
    return this.refreshPromise;
  }

  private async refresh(): Promise<string> {
    // ponytail: без повторов на 5xx эндпоинта токена (1.x повторял) — ошибка уходит
    // модели как isError, и она повторяет вызов сама. Добавить цикл, если начнёт флапать.
    const response = await fetch(`${BASE_URL}/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
      signal: AbortSignal.timeout(TIMEOUT),
    });

    if (!response.ok) {
      // Тело не пересказываем: ответ OAuth может отражать присланные учётные данные,
      // а это сообщение через withErrorHandling попадает в контекст модели.
      throw new ApiError(
        response.status,
        `SendPulse OAuth: HTTP ${response.status}. Проверьте SENDPULSE_ID и SENDPULSE_SECRET.`,
      );
    }

    const data = (await response.json()) as SendPulseTokenResponse;
    if (!data.access_token) {
      throw new Error("SendPulse OAuth: в ответе нет access_token");
    }
    this.token = data.access_token;
    this.expiresAt = Date.now() + (data.expires_in - 60) * 1000;
    return this.token;
  }
}

// ponytail: ключ кэша — сами учётные данные, смена env пересобирает клиент и токен.
let cached: { key: string; client: BaseHttpClient } | null = null;

/** Клиент создаётся лениво: без env модуль импортируется, ошибка — только при вызове. */
function getClient(): BaseHttpClient {
  const id = process.env["SENDPULSE_ID"];
  const secret = process.env["SENDPULSE_SECRET"];
  if (!id || !secret) {
    throw new Error("Переменные окружения SENDPULSE_ID и SENDPULSE_SECRET не заданы");
  }
  const key = `${id}\n${secret}`;
  if (cached?.key === key) return cached.client;

  cached = {
    key,
    client: new BaseHttpClient({
      baseUrl: BASE_URL,
      timeout: TIMEOUT,
      maxRetries: 3,
      auth: new SendPulseAuthStrategy(id, secret),
      logger,
    }),
  };
  return cached.client;
}

/**
 * 1.x клал тело ошибки SendPulse в текст исключения («Sender is not valid» и т.п.),
 * ядро держит его в ApiError.body. Возвращаем его в сообщение — withErrorHandling
 * всё равно санитизирует и обрезает текст до модели.
 */
async function call(fn: (client: BaseHttpClient) => Promise<unknown>): Promise<unknown> {
  try {
    return await fn(getClient());
  } catch (error) {
    if (error instanceof ApiError && error.status > 0 && error.body) {
      throw new ApiError(
        error.status,
        `${error.message}\nОтвет SendPulse: ${error.body}`,
        error.body,
        error.headers,
        error.code,
      );
    }
    throw error;
  }
}

export async function apiGet(path: string): Promise<unknown> {
  return call((client) => client.get(path));
}

export async function apiPost(path: string, body: Record<string, unknown>): Promise<unknown> {
  return call((client) => client.post(path, body));
}
