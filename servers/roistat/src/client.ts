/**
 * Roistat API client.
 *
 * Wraps @theyahia/mcp-core's BaseHttpClient (retry, timeout, SSRF guard,
 * ApiError categorisation) instead of the hand-rolled fetch boilerplate.
 *
 * Auth is a raw `Api-key` header with no Bearer prefix, so it goes through the
 * `headers` option + NoAuthStrategy rather than ApiKeyStrategy.
 *
 * Every request carries `?project=<ROISTAT_PROJECT_ID>`.
 *
 * Env: ROISTAT_API_KEY, ROISTAT_PROJECT_ID (both required).
 */

import { BaseHttpClient, NoAuthStrategy, createLogger } from "@theyahia/mcp-core";

const BASE_URL = "https://cloud.roistat.com/api/v1";
const TIMEOUT = 15_000;

const logger = createLogger("roistat-mcp");

/** Roistat answers HTTP 200 with `{status:"error", errors:[...]}` — surface it as a throw. */
function checkApiStatus(data: unknown): unknown {
  if (
    data &&
    typeof data === "object" &&
    (data as Record<string, unknown>)["status"] === "error"
  ) {
    throw new Error(
      `Roistat: ${JSON.stringify((data as Record<string, unknown>)["errors"])}`,
    );
  }
  return data;
}

export class RoistatClient {
  private readonly projectId: string;
  private readonly http: BaseHttpClient;

  constructor(apiKey?: string, projectId?: string) {
    const key = apiKey ?? process.env["ROISTAT_API_KEY"] ?? "";
    this.projectId = projectId ?? process.env["ROISTAT_PROJECT_ID"] ?? "";

    if (!key) {
      throw new Error(
        "Переменная окружения ROISTAT_API_KEY обязательна. " +
          "Получите ключ в личном кабинете Roistat.",
      );
    }
    if (!this.projectId) {
      throw new Error(
        "Переменная окружения ROISTAT_PROJECT_ID обязательна. " +
          "Укажите ID проекта из личного кабинета Roistat.",
      );
    }

    this.http = new BaseHttpClient({
      baseUrl: BASE_URL,
      timeout: TIMEOUT,
      maxRetries: 3,
      auth: new NoAuthStrategy(),
      headers: { "Api-key": key },
      logger,
    });
  }

  async post(path: string, body: Record<string, unknown>): Promise<unknown> {
    return checkApiStatus(
      await this.http.request({
        method: "POST",
        path,
        body,
        params: { project: this.projectId },
      }),
    );
  }

  async get(path: string, params?: Record<string, string>): Promise<unknown> {
    return checkApiStatus(
      await this.http.get(path, { ...params, project: this.projectId }),
    );
  }
}

// ponytail: lazy singleton — tools are imported at server startup, so reading env
// eagerly at module scope would crash the whole process before any tool runs.
let _client: RoistatClient | null = null;

export function getClient(): RoistatClient {
  if (!_client) _client = new RoistatClient();
  return _client;
}
