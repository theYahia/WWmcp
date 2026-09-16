/**
 * Alfa API HTTP client (Alfa-Bank Business).
 *
 * Base: https://baas.alfabank.ru (override via ALFA_BASE_URL).
 * Auth: OAuth 2.0 / OpenID Connect via Alfa ID — token at POST /oidc/token.
 *
 * ⚠️ Endpoint-accuracy note: paths below are aligned to the public docs at
 * https://developers.alfabank.ru/products/alfa-api/documentation. Items marked
 * `// VERIFY` are MEDIUM-confidence (the exact path/params should be confirmed
 * against the live Swagger on the doc page). The production API additionally
 * requires mTLS (see auth/mtls.ts) and a PKCS#7 GOST signature on operational
 * methods (see auth/signer.ts) — without those it cannot reach the live contour.
 *
 * Robustness:
 *   - Hard per-request timeout (AbortController), configurable via ALFA_TIMEOUT_MS
 *   - Bounded retries with exponential backoff + jitter on 429 / 5xx / network / timeout —
 *     GET only; the payment POST is never repeated automatically (no double payment)
 *   - 401 → drop the cached token and re-authenticate once
 *   - Credentials are never placed in error messages
 */
import type {
  AlfaAccount,
  AlfaAuthConfig,
  AlfaBalance,
  AlfaCounterparty,
  AlfaExchangeRate,
  AlfaPaymentOrder,
  AlfaSalaryRegistry,
  AlfaStatement,
  AlfaTokenResponse,
} from "./types.js";
import { type Signer, UnimplementedSigner } from "./auth/signer.js";

const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 3;
const BACKOFF_BASE_MS = 1_000;
const BACKOFF_MAX_MS = 8_000;

interface RequestOptions {
  body?: Record<string, unknown>;
  /** Attach an X-Alfabank-Signature header (required for operational methods). */
  sign?: boolean;
}

function mapHttpError(status: number, detail?: string): string {
  const base = (() => {
    switch (status) {
      case 400:
        return "Bad request. Check parameters.";
      case 401:
        return "Authentication failed. Check ALFA_CLIENT_ID / ALFA_CLIENT_SECRET (and scope).";
      case 403:
        return "Access forbidden. Check OAuth scopes and that the account is authorized.";
      case 404:
        return "Not found.";
      case 429:
        return "Rate limit exceeded. Wait before retrying.";
      default:
        return status >= 500
          ? `Alfa API service error (HTTP ${status}). Try again later.`
          : `Unexpected HTTP ${status} from Alfa API.`;
    }
  })();
  return detail ? `${base} Alfa: ${detail}` : base;
}

function isTransientStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

function backoffDelay(attempt: number): number {
  const base = Math.min(BACKOFF_BASE_MS * 2 ** attempt, BACKOFF_MAX_MS);
  // Full jitter (50%–100% of base) to avoid synchronized retries.
  return base * (0.5 + Math.random() * 0.5);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isAbort(err: unknown): boolean {
  const name = (err as { name?: string } | null)?.name;
  return name === "AbortError" || name === "TimeoutError";
}

export class AlfaBankClient {
  private readonly config: AlfaAuthConfig;
  private readonly signer: Signer;
  private readonly timeoutMs: number;
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor(config: AlfaAuthConfig) {
    this.config = config;
    this.signer = config.signer ?? new UnimplementedSigner();
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  private async fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  /** OIDC client-credentials token from POST /oidc/token (cached until expiry). */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const params: Record<string, string> = {
      grant_type: "client_credentials",
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    };
    if (this.config.scope) params.scope = this.config.scope;

    let lastError = "Auth failed: max retries exceeded.";
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      let resp: Response;
      try {
        resp = await this.fetchWithTimeout(`${this.config.baseUrl}/oidc/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
          body: new URLSearchParams(params),
        });
      } catch (err) {
        lastError = isAbort(err)
          ? `Auth request timed out (${Math.round(this.timeoutMs / 1000)}s).`
          : `Auth network error: ${err instanceof Error ? err.message : "unknown"}`;
        if (attempt < MAX_RETRIES) {
          await sleep(backoffDelay(attempt));
          continue;
        }
        throw new Error(lastError);
      }

      if (!resp.ok) {
        // The status may carry an OAuth error code, but never our secret.
        lastError = `Auth failed: ${resp.status}`;
        if (isTransientStatus(resp.status) && attempt < MAX_RETRIES) {
          await sleep(backoffDelay(attempt));
          continue;
        }
        throw new Error(lastError);
      }

      const data = (await resp.json()) as AlfaTokenResponse;
      this.accessToken = data.access_token;
      this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
      return this.accessToken;
    }
    throw new Error(lastError);
  }

  private async request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
    const { body, sign } = opts;
    const payload = body !== undefined ? JSON.stringify(body) : undefined;

    // Operational methods must be signed. The default signer throws here with
    // guidance, before any request is sent — never silently calls the wire.
    const signature = sign ? await this.signer.sign(payload ?? "") : undefined;

    // Only GET is repeated after an ambiguous failure (timeout, network, 429, 5xx).
    // POST here submits a payment registry: a timeout does not mean the bank skipped
    // it, and a blind repeat pays twice. Same rule as BaseHttpClient in
    // @theyahia/mcp-core. A 401 is a clean rejection, so the one re-auth stays.
    const retryable = method === "GET";
    const notRetried = retryable
      ? ""
      : " Not retried automatically: the bank may have already accepted this request — " +
        "check get_payment_status before repeating.";

    let reauthed = false;
    let lastError = "Request failed: max retries exceeded.";

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      // Auth errors are terminal — let them propagate without retrying here.
      const token = await this.getAccessToken();

      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };
      if (payload !== undefined) headers["Content-Type"] = "application/json";
      if (signature !== undefined) headers["X-Alfabank-Signature"] = signature;

      // Only the network call is wrapped — HTTP-status handling lives outside the
      // try so a deliberately thrown mapped error is never mistaken for a network
      // error (which would otherwise trigger a spurious retry).
      let resp: Response;
      try {
        resp = await this.fetchWithTimeout(`${this.config.baseUrl}${path}`, {
          method,
          headers,
          body: payload,
        });
      } catch (err) {
        lastError = isAbort(err)
          ? `Request timed out (${Math.round(this.timeoutMs / 1000)}s). Alfa API may be slow.`
          : `Network error: ${err instanceof Error ? err.message : "unknown"}`;
        if (retryable && attempt < MAX_RETRIES) {
          await sleep(backoffDelay(attempt));
          continue;
        }
        throw new Error(lastError + notRetried);
      }

      if (resp.status === 401 && !reauthed) {
        this.accessToken = null;
        reauthed = true;
        continue; // re-authenticate and retry once
      }

      if (resp.ok) {
        const text = await resp.text();
        return (text ? JSON.parse(text) : null) as T;
      }

      const detail = await resp.text().catch(() => undefined);
      lastError = mapHttpError(resp.status, detail?.slice(0, 300));
      if (isTransientStatus(resp.status)) {
        if (retryable && attempt < MAX_RETRIES) {
          await sleep(backoffDelay(attempt));
          continue;
        }
        throw new Error(lastError + notRetried);
      }
      throw new Error(lastError);
    }
    throw new Error(lastError);
  }

  // ---------------------------------------------------------------------------
  // Accounts
  // ---------------------------------------------------------------------------

  async listAccounts(): Promise<AlfaAccount[]> {
    return this.request<AlfaAccount[]>("GET", "/api/pp/v1/accounts");
  }

  async getAccountBalance(accountId: string): Promise<AlfaBalance> {
    // VERIFY: own-account balance path not firmly confirmed in public docs;
    // partner flows expose /na/jp/v1/beneficiaries/{id}/balance. See https://developers.alfabank.ru/products/alfa-api/documentation.
    return this.request<AlfaBalance>("GET", `/api/pp/v1/accounts/${encodeURIComponent(accountId)}/balance`);
  }

  async getAccountStatement(accountNumber: string, dateFrom: string, dateTo: string): Promise<AlfaStatement> {
    // Docs: GET /api/statement/transactions?accountNumber=&statementDate=&page=&curFormat=
    // VERIFY: docs use a per-day `statementDate` + `page`; we pass a date range
    // (dateFrom/dateTo) for usability — confirm range semantics at https://developers.alfabank.ru/products/alfa-api/documentation.
    const qs = new URLSearchParams({ accountNumber, dateFrom, dateTo });
    return this.request<AlfaStatement>("GET", `/api/statement/transactions?${qs}`);
  }

  // ---------------------------------------------------------------------------
  // Payments (registry + signature model)
  // ---------------------------------------------------------------------------

  async createPaymentOrder(params: {
    fromAccount: string;
    toAccount: string;
    toBik: string;
    amount: number;
    purpose: string;
  }): Promise<AlfaPaymentOrder> {
    // Real Alfa API processes payments as SIGNED REGISTRIES, not a single POST:
    // create/patch a registry → POST /api/jp/v1/registries/{id}/signatures with a
    // PKCS#7 GOST signature → poll status. Signing requires a real certificate,
    // so this throws via the default UnimplementedSigner. VERIFY exact registry
    // create payload at https://developers.alfabank.ru/products/alfa-api/documentation.
    const body = {
      amount: params.amount,
      purpose: params.purpose,
      payer: { account: params.fromAccount },
      payee: { account: params.toAccount, bic: params.toBik },
    };
    return this.request<AlfaPaymentOrder>("POST", "/api/jp/v1/registries", { body, sign: true });
  }

  async getPaymentStatus(paymentId: string): Promise<AlfaPaymentOrder> {
    // VERIFY: payment status is read from the registry resource. See https://developers.alfabank.ru/products/alfa-api/documentation.
    return this.request<AlfaPaymentOrder>("GET", `/api/jp/v1/registries/${encodeURIComponent(paymentId)}`);
  }

  // ---------------------------------------------------------------------------
  // References
  // ---------------------------------------------------------------------------

  async listCounterparties(): Promise<AlfaCounterparty[]> {
    // VERIFY: counterparties are modelled as "beneficiaries" in the partner API
    // (/na/jp/v1/beneficiaries). Confirm the list endpoint at https://developers.alfabank.ru/products/alfa-api/documentation.
    return this.request<AlfaCounterparty[]>("GET", "/na/jp/v1/beneficiaries");
  }

  async getExchangeRates(): Promise<AlfaExchangeRate[]> {
    // Docs: GET /api/rates/gd/v1/offices-rates?limit=&offset= (rates at offices).
    // VERIFY whether conversion rates need a different endpoint. See https://developers.alfabank.ru/products/alfa-api/documentation.
    return this.request<AlfaExchangeRate[]>("GET", "/api/rates/gd/v1/offices-rates?limit=50&offset=0");
  }

  async getSalaryRegistry(): Promise<AlfaSalaryRegistry[]> {
    // VERIFY: payroll uses the general registries mechanism; exact path/filter
    // not confirmed in public docs. See https://developers.alfabank.ru/products/alfa-api/documentation.
    return this.request<AlfaSalaryRegistry[]>("GET", "/api/jp/v1/registries?type=SALARY");
  }
}
