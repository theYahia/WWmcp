/**
 * HTTP client for the Russian Post (Почта России) APIs.
 *
 * Pochta exposes several APIs on different hosts, each with its own base path:
 *   - otpravka-api.pochta.ru/1.0          — authed REST (tariff, delivery, clean/address)
 *   - otpravka-api.pochta.ru/postoffice/1.0 — post office search (sibling of /1.0, NOT nested)
 *   - tariff.pochta.ru/v2                  — free tariff calculator (no auth)  [VERIFY]
 *   - tracking.russianpost.ru/rtm34        — SOAP single-barcode tracking (login/password)
 *
 * Because the hosts carry a path prefix, the request URL is built by string
 * concatenation (`host + path`), NOT `new URL(path, host)` — the latter would
 * drop the prefix for absolute paths (e.g. new URL("/tariff", ".../1.0") →
 * ".../tariff", losing "/1.0").
 *
 * Authorization (otpravka REST) — per the official spec:
 *   Authorization:        AccessToken <access_token>          (POCHTA_TOKEN)
 *   X-User-Authorization: Basic <base64(login:password)>      (POCHTA_LOGIN/PASSWORD)
 */

/** API host base URLs (each already includes its version/path prefix). */
export const HOSTS = {
  otpravka: "https://otpravka-api.pochta.ru/1.0",
  postoffice: "https://otpravka-api.pochta.ru/postoffice/1.0",
  tariff: "https://tariff.pochta.ru/v2",
  tracking: "https://tracking.russianpost.ru/rtm34",
} as const;

export type PochtaHost = (typeof HOSTS)[keyof typeof HOSTS];

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_RETRIES = 3;

export interface PochtaAuth {
  /** Access token -> "Authorization: AccessToken <token>". */
  token: string;
  /** base64(login:password) -> "X-User-Authorization: Basic <userBasic>". */
  userBasic: string;
}

export interface PochtaClientOptions {
  auth?: PochtaAuth;
  maxRetries?: number;
  /** Per-request timeout in ms (default 15000, or POCHTA_TIMEOUT_MS env). */
  timeoutMs?: number;
}

export interface RequestOptions {
  /** Target host base URL (default HOSTS.otpravka). */
  host?: PochtaHost;
  query?: Record<string, string | undefined>;
  /** Attach auth headers (default true). Set false for the free tariff API. */
  authed?: boolean;
  /** Per-call timeout override in ms. */
  timeoutMs?: number;
}

/**
 * Resolve credentials from the environment.
 *
 * Preferred: POCHTA_TOKEN (access token) + POCHTA_LOGIN + POCHTA_PASSWORD.
 * Back-compat: POCHTA_KEY may carry a pre-computed base64(login:password) that
 * maps to X-User-Authorization (NOT Authorization — that was the old bug).
 */
export function getAuth(): PochtaAuth {
  const token = process.env.POCHTA_TOKEN ?? "";
  const login = process.env.POCHTA_LOGIN ?? "";
  const password = process.env.POCHTA_PASSWORD ?? "";
  const key = process.env.POCHTA_KEY ?? "";

  let userBasic = "";
  if (login && password) {
    userBasic = Buffer.from(`${login}:${password}`).toString("base64");
  } else if (key) {
    // Tolerate a value that already includes the "Basic " scheme prefix.
    userBasic = key.startsWith("Basic ") ? key.slice("Basic ".length) : key;
  }

  if (token && userBasic) {
    return { token, userBasic };
  }

  throw new Error(
    "Требуется авторизация. Укажите POCHTA_TOKEN + POCHTA_LOGIN + POCHTA_PASSWORD " +
      "(POCHTA_TOKEN — access-токен приложения; LOGIN/PASSWORD — учётные данные кабинета). " +
      "Получите доступ к API: https://otpravka.pochta.ru/specification",
  );
}

export class PochtaClient {
  private readonly auth: PochtaAuth;
  private readonly maxRetries: number;
  private readonly timeoutMs: number;

  constructor(options: PochtaClientOptions = {}) {
    this.auth = options.auth ?? getAuth();
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    const envTimeout = process.env.POCHTA_TIMEOUT_MS
      ? parseInt(process.env.POCHTA_TIMEOUT_MS, 10)
      : NaN;
    this.timeoutMs =
      options.timeoutMs ??
      (Number.isFinite(envTimeout) && envTimeout > 0 ? envTimeout : DEFAULT_TIMEOUT_MS);
  }

  /** Auth headers per the otpravka spec: AccessToken in Authorization, Basic in X-User-Authorization. */
  private authHeaders(): Record<string, string> {
    return {
      Authorization: `AccessToken ${this.auth.token}`,
      "X-User-Authorization": `Basic ${this.auth.userBasic}`,
    };
  }

  async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown,
    opts: RequestOptions = {},
  ): Promise<T> {
    const host = opts.host ?? HOSTS.otpravka;
    const url = new URL(`${host}${path}`);
    if (opts.query) {
      for (const [k, v] of Object.entries(opts.query)) {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      }
    }
    const urlStr = url.toString();
    const timeoutMs = opts.timeoutMs ?? this.timeoutMs;
    const authed = opts.authed !== false;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json;charset=UTF-8",
    };
    if (authed) Object.assign(headers, this.authHeaders());

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      let response: Response;
      try {
        const init: RequestInit = { method, headers, signal: controller.signal };
        if (body !== undefined) init.body = JSON.stringify(body);
        response = await fetch(urlStr, init);
      } catch (err) {
        clearTimeout(timer);
        const aborted = err instanceof Error && err.name === "AbortError";
        if (aborted) {
          // A timeout already consumed the full budget — retrying just multiplies latency.
          throw new Error(`Почта России: таймаут запроса (${timeoutMs} мс). Попробуйте позже.`);
        }
        lastError = new Error(
          `Почта России: сетевая ошибка ${method} ${path}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
        if (attempt < this.maxRetries) {
          console.error(
            `[pochta-russia-mcp] retry ${attempt + 1}/${this.maxRetries} ${method} ${path} (network error)`,
          );
          await this.sleep(this.backoff(attempt));
          continue;
        }
        throw lastError;
      }
      clearTimeout(timer);

      if (!response.ok) {
        const detail = await this.extractError(response);
        lastError = new Error(`Почта России HTTP ${response.status} (${method} ${path}): ${detail}`);
        // Retry 429 and 5xx only; other 4xx are caller errors.
        if ((response.status === 429 || response.status >= 500) && attempt < this.maxRetries) {
          console.error(
            `[pochta-russia-mcp] retry ${attempt + 1}/${this.maxRetries} ${method} ${path} (HTTP ${response.status})`,
          );
          await this.sleep(this.backoff(attempt));
          continue;
        }
        throw lastError;
      }

      if (response.status === 204) return undefined as T;
      return (await response.json()) as T;
    }

    throw lastError ?? new Error(`Почта России: ${method} ${path} — все попытки исчерпаны.`);
  }

  async get<T = unknown>(
    path: string,
    query?: Record<string, string | undefined>,
    opts?: Omit<RequestOptions, "query">,
  ): Promise<T> {
    return this.request<T>("GET", path, undefined, { ...opts, query });
  }

  async post<T = unknown>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> {
    return this.request<T>("POST", path, body, opts);
  }

  /** Exponential backoff with an 8s cap: 500, 1000, 2000, ... ms. */
  private backoff(attempt: number): number {
    return Math.min(500 * 2 ** attempt, 8000);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** Parse a Pochta error body into a concise, human-readable message. */
  private async extractError(response: Response): Promise<string> {
    const text = await response.text().catch(() => "");
    if (!text) return response.statusText || "(пустой ответ)";
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      if (typeof parsed.desc === "string") return parsed.desc;
      if (typeof parsed.message === "string") return parsed.message;
      if (typeof parsed.error === "string") return parsed.error;
    } catch {
      /* fall through to raw text */
    }
    return text.slice(0, 500);
  }

  /**
   * Track a shipment by barcode via the SOAP single-tracking API
   * (tracking.russianpost.ru/rtm34), which requires POCHTA_LOGIN + POCHTA_PASSWORD.
   *
   * Note: there is no token-only public single-barcode tracking endpoint on
   * otpravka-api; the old REST fallback (/shipment/search) searched the
   * account's own shipments, not public tracking, so it has been removed.
   */
  async trackByBarcode(barcode: string): Promise<unknown> {
    const login = process.env.POCHTA_LOGIN ?? "";
    const password = process.env.POCHTA_PASSWORD ?? "";

    if (!login || !password) {
      throw new Error(
        "Для отслеживания по трек-номеру нужны POCHTA_LOGIN + POCHTA_PASSWORD: " +
          "трекинг использует SOAP API tracking.russianpost.ru, а не access-токен.",
      );
    }

    const soapBody = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
  xmlns:oper="http://russianpost.org/operationhistory"
  xmlns:data="http://russianpost.org/operationhistory/data"
  xmlns:soapenv="http://www.w3.org/2003/05/soap-envelope">
  <soap:Header/>
  <soap:Body>
    <oper:getOperationHistory>
      <data:OperationHistoryRequest>
        <data:Barcode>${barcode}</data:Barcode>
        <data:MessageType>0</data:MessageType>
        <data:Language>RUS</data:Language>
      </data:OperationHistoryRequest>
      <data:AuthorizationHeader soapenv:mustUnderstand="1">
        <data:login>${login}</data:login>
        <data:password>${password}</data:password>
      </data:AuthorizationHeader>
    </oper:getOperationHistory>
  </soap:Body>
</soap:Envelope>`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(HOSTS.tracking, {
        method: "POST",
        headers: { "Content-Type": "application/soap+xml;charset=UTF-8" },
        body: soapBody,
        signal: controller.signal,
      });
      clearTimeout(timer);

      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Почта России (трекинг) HTTP ${response.status}: ${text.slice(0, 500)}`);
      }

      return this.parseSoapTracking(text, barcode);
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Почта России: таймаут запроса отслеживания. Попробуйте позже.");
      }
      throw error;
    }
  }

  private parseSoapTracking(xml: string, barcode: string): unknown {
    const events: Array<Record<string, string>> = [];
    const itemRegex = /<historyRecord>([\s\S]*?)<\/historyRecord>/g;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];
      const operType = this.extractTag(block, "OperType", "Name");
      const operAttr = this.extractTag(block, "OperAttr", "Name");
      const operDate = this.extractSimpleTag(block, "OperDate");
      const address =
        this.extractTag(block, "OperationAddress", "Description") ||
        this.extractSimpleTag(block, "Description");

      events.push({
        операция: operType || "Неизвестно",
        атрибут: operAttr || "",
        дата: operDate || "",
        место: address || "",
      });
    }

    if (events.length === 0) {
      return { трек_номер: barcode, сообщение: "Информация об отправлении не найдена." };
    }

    const last = events[events.length - 1];
    return {
      трек_номер: barcode,
      последний_статус: last,
      все_события: events,
    };
  }

  private extractTag(block: string, parentTag: string, childTag: string): string | null {
    const openTag = "<" + parentTag + ">";
    const closeTag = "</" + parentTag + ">";
    const start = block.indexOf(openTag);
    if (start === -1) return null;
    const end = block.indexOf(closeTag, start);
    if (end === -1) return null;
    const inner = block.substring(start + openTag.length, end);
    return this.extractSimpleTag(inner, childTag);
  }

  private extractSimpleTag(block: string, tag: string): string | null {
    const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`);
    const match = regex.exec(block);
    return match ? match[1] : null;
  }
}
