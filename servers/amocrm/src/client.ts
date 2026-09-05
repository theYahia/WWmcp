/**
 * amoCRM API client.
 *
 * Wraps @theyahia/mcp-core's RateLimitedClient (token bucket: 7 req/s — amoCRM's
 * documented per-account limit) so retry/timeout/backoff/error shaping come from
 * the core instead of a hand-rolled fetch loop.
 *
 * Auth lives here rather than in core: core's OAuthStrategy only implements
 * `grant_type=client_credentials`, while amoCRM needs `refresh_token` with a JSON
 * body and a redirect_uri, and rotates the refresh token on every use.
 *
 * Env vars:
 *   - AMOCRM_SUBDOMAIN — "mycompany" from mycompany.amocrm.ru
 *     (AMOCRM_DOMAIN accepted as a legacy alias)
 *   - AMOCRM_ACCESS_TOKEN — OAuth access token (required)
 *
 * Optional (enable auto-refresh when the access token expires):
 *   - AMOCRM_REFRESH_TOKEN, AMOCRM_CLIENT_ID, AMOCRM_CLIENT_SECRET
 *
 * Lazy init — env is read on the first request, so importing this module
 * (tool discovery, Smithery scan) never throws on a missing token.
 */

import {
  RateLimitedClient,
  createLogger,
  type AuthStrategy,
} from "@theyahia/mcp-core";

const logger = createLogger("amocrm-mcp");

interface Config {
  subdomain: string;
  accessToken: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
}

function getConfig(): Config {
  const subdomain = process.env.AMOCRM_SUBDOMAIN || process.env.AMOCRM_DOMAIN;
  const accessToken = process.env.AMOCRM_ACCESS_TOKEN;
  if (!subdomain) throw new Error("AMOCRM_SUBDOMAIN is not set");
  if (!accessToken) throw new Error("AMOCRM_ACCESS_TOKEN is not set");
  return {
    subdomain: subdomain.replace(/\.amocrm\.ru$/, ""),
    accessToken,
    refreshToken: process.env.AMOCRM_REFRESH_TOKEN,
    clientId: process.env.AMOCRM_CLIENT_ID,
    clientSecret: process.env.AMOCRM_CLIENT_SECRET,
  };
}

/**
 * Bearer auth seeded from AMOCRM_ACCESS_TOKEN. On 401 the core client calls
 * `invalidate()` and retries; the next `authenticate()` then runs the amoCRM
 * refresh_token flow.
 */
class AmoCrmAuthStrategy implements AuthStrategy {
  readonly type = "amocrm_oauth";
  private token: string | null;
  private refreshPromise: Promise<string> | null = null;

  constructor(private readonly config: Config) {
    this.token = config.accessToken;
  }

  invalidate(): void {
    this.token = null;
  }

  async authenticate(req: RequestInit): Promise<RequestInit> {
    const token = this.token ?? (await this.getFreshToken());
    // ponytail: plain-object header merge — BaseHttpClient always hands us a
    // plain object, and keeping it one (instead of core's Headers) leaves
    // headers.Authorization readable by the unit tests.
    const headers = {
      ...(req.headers as Record<string, string> | undefined),
      Authorization: `Bearer ${token}`,
    };
    return { ...req, headers };
  }

  /** Dedups concurrent refreshes — amoCRM rotates the refresh token, so a
   *  second parallel refresh would present an already-consumed one. */
  private async getFreshToken(): Promise<string> {
    if (this.refreshPromise) return this.refreshPromise;
    this.refreshPromise = this.refresh();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async refresh(): Promise<string> {
    const { subdomain, refreshToken, clientId, clientSecret } = this.config;

    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error(
        "Токен amoCRM истёк (401), а авто-обновление не настроено. " +
          "Задайте AMOCRM_REFRESH_TOKEN + AMOCRM_CLIENT_ID + AMOCRM_CLIENT_SECRET " +
          "или обновите AMOCRM_ACCESS_TOKEN вручную.",
      );
    }

    const response = await fetch(
      `https://${subdomain}.amocrm.ru/oauth2/access_token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          redirect_uri: `https://${subdomain}.amocrm.ru`,
        }),
        // Without an abort signal a hung amoCRM auth endpoint blocks every tool
        // call indefinitely — this fetch does not go through BaseHttpClient.
        signal: AbortSignal.timeout(15_000),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Не удалось обновить токен amoCRM (HTTP ${response.status}). ` +
          "Проверьте AMOCRM_CLIENT_ID / AMOCRM_CLIENT_SECRET и актуальность refresh-токена.",
      );
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token: string;
    };

    // amoCRM rotates the refresh token on every use — keep the newest one or the
    // next refresh in this process fails.
    this.config.refreshToken = data.refresh_token;
    this.token = data.access_token;
    process.env.AMOCRM_ACCESS_TOKEN = data.access_token;
    process.env.AMOCRM_REFRESH_TOKEN = data.refresh_token;
    logger.info("Access token refreshed");

    return data.access_token;
  }
}

let client: RateLimitedClient | null = null;

function getClient(): RateLimitedClient {
  if (client) return client;
  const config = getConfig();
  client = new RateLimitedClient({
    baseUrl: `https://${config.subdomain}.amocrm.ru/api/v4`,
    timeout: 15_000,
    maxRetries: 3,
    bucketMax: 7,
    bucketRefillMs: 1000,
    auth: new AmoCrmAuthStrategy(config),
    logger,
  });
  return client;
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const query = params
    ? Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
      )
    : undefined;
  // amoCRM answers 204 on empty result sets; core returns null there, callers
  // JSON.stringify the result and expect an object.
  return ((await getClient().get(path, query)) ?? {}) as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return ((await getClient().post(path, body)) ?? {}) as T;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return ((await getClient().request({ method: "PATCH", path, body })) ??
    {}) as T;
}
