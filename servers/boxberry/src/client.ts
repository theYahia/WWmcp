import {
  ApiError,
  BaseHttpClient,
  NoAuthStrategy,
  createLogger,
} from "@theyahia/mcp-core";

const logger = createLogger("boxberry-mcp");

// ponytail: Boxberry authenticates via a `token` *query param*, not a header —
// hence NoAuthStrategy plus the token injected into every request's params.
const http = new BaseHttpClient({
  baseUrl: "https://api.boxberry.ru",
  timeout: 15_000,
  maxRetries: 3,
  auth: new NoAuthStrategy(),
  logger,
});

export class BoxberryClient {
  private token: string;

  constructor(token?: string) {
    this.token =
      token ??
      process.env.BOXBERRY_API_TOKEN ??
      process.env.BOXBERRY_TOKEN ??
      "";
    if (!this.token) {
      throw new Error(
        "Переменная окружения BOXBERRY_API_TOKEN обязательна. " +
          "Получите токен в личном кабинете Boxberry.",
      );
    }
  }

  async call(
    method: string,
    params?: Record<string, string>,
  ): Promise<unknown> {
    let data: unknown;
    try {
      data = await http.get("/json.php", {
        token: this.token,
        method,
        ...params,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        // Re-brand with the Boxberry prefix but keep ApiError so mcp-core's
        // withErrorHandling can still categorise (auth / rate_limit / 5xx).
        // status 0 = timeout or transport failure, which has no HTTP code.
        throw new ApiError(
          error.status,
          error.status > 0
            ? `Boxberry HTTP ${error.status}: ${error.body ?? error.message}`
            : `Boxberry: ${error.message}`,
          error.body,
          error.headers,
          error.code,
        );
      }
      throw error;
    }

    // Boxberry signals logical failures (bad token, unknown method) with HTTP
    // 200 and an `err` field in the body.
    if (
      data &&
      typeof data === "object" &&
      "err" in data &&
      (data as Record<string, unknown>).err
    ) {
      throw new Error(`Boxberry: ${(data as Record<string, unknown>).err}`);
    }

    return data;
  }
}
