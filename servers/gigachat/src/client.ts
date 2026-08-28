import {
  ApiError,
  BaseHttpClient,
  createLogger,
  type AuthStrategy,
} from "@theyahia/mcp-core";
import type { OAuthTokenResponse } from "./types.js";

const API_BASE = "https://gigachat.devices.sberbank.ru/api/v1";
const OAUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";
const TIMEOUT = 30_000;

const logger = createLogger("gigachat-mcp");

/** OAuth scope: GIGACHAT_API_PERS (individuals), _B2B (prepaid legal), _CORP (postpaid legal). */
function getScope(): string {
  return process.env.GIGACHAT_SCOPE || "GIGACHAT_API_PERS";
}

/**
 * Sber's OAuth is not RFC client_credentials: the whole credential arrives
 * pre-base64'd in GIGACHAT_AUTH_KEY, the scope goes in the body, an RqUID
 * header is mandatory, and the response carries an absolute `expires_at`
 * (epoch ms) instead of `expires_in`. Core's OAuthStrategy fits none of that,
 * so this implements core's AuthStrategy interface directly — BaseHttpClient
 * still drives retries, timeouts and 401-invalidate around it.
 */
export class GigaChatAuthStrategy implements AuthStrategy {
  readonly type = "gigachat-oauth";
  private token: string | null = null;
  private expiresAt = 0;
  private refreshPromise: Promise<string> | null = null;

  invalidate(): void {
    this.token = null;
    this.expiresAt = 0;
  }

  async authenticate(req: RequestInit): Promise<RequestInit> {
    const headers = new Headers(req.headers);
    headers.set("Authorization", `Bearer ${await this.getToken()}`);
    return { ...req, headers };
  }

  async getToken(): Promise<string> {
    if (this.token && Date.now() < this.expiresAt - 60_000) {
      return this.token;
    }
    // Deduplicate concurrent refreshes
    if (this.refreshPromise) return this.refreshPromise;
    this.refreshPromise = this.refresh();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async refresh(): Promise<string> {
    const authKey = process.env.GIGACHAT_AUTH_KEY;
    if (!authKey) throw new Error("GIGACHAT_AUTH_KEY is not set");

    const response = await fetch(OAUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: `Basic ${authKey}`,
        RqUID: crypto.randomUUID(),
      },
      body: `scope=${encodeURIComponent(getScope())}`,
      signal: AbortSignal.timeout(TIMEOUT),
    });

    if (!response.ok) {
      throw new ApiError(
        response.status,
        `OAuth error ${response.status}: ${response.statusText}. Проверьте GIGACHAT_AUTH_KEY и scope.`,
        await response.text().catch(() => ""),
      );
    }

    const data = (await response.json()) as OAuthTokenResponse;
    this.token = data.access_token;
    this.expiresAt = data.expires_at;
    return this.token;
  }
}

const auth = new GigaChatAuthStrategy();

const client = new BaseHttpClient({
  baseUrl: API_BASE,
  timeout: TIMEOUT,
  maxRetries: 3,
  auth,
  logger,
  headers: { Accept: "application/json" },
});

export async function gigachatGet(path: string): Promise<unknown> {
  return client.get(path);
}

export async function gigachatPost(path: string, body: unknown): Promise<unknown> {
  return client.post(path, body);
}

/**
 * Multipart upload. BaseHttpClient always JSON-encodes the body, so this one
 * calls fetch directly — but token handling still comes from the shared
 * strategy, so there is no second copy of the OAuth logic.
 * ponytail: no retry loop here (BaseHttpClient's isn't reusable for multipart);
 * a 429/5xx surfaces as an isError result the model can retry. Add a loop if
 * uploads turn out to be flaky in practice.
 */
export async function gigachatPostFormData(
  path: string,
  formData: FormData,
): Promise<unknown> {
  const init = await auth.authenticate({
    method: "POST",
    headers: { Accept: "application/json" },
    body: formData,
    signal: AbortSignal.timeout(TIMEOUT),
  });

  const response = await fetch(`${API_BASE}${path}`, init);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      `GigaChat HTTP ${response.status}: ${response.statusText}`,
      await response.text().catch(() => ""),
    );
  }
  return response.json();
}
