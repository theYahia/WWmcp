import { redact } from "./redact.js";
import type {
  Account,
  AuthProvider,
  Balance,
  Customer,
  PaymentForSignRequest,
  PaymentForSignResult,
  PaymentStatusResult,
  Statement,
  TochkaEnvelope,
} from "./types.js";

export const DEFAULT_BASE_URL = "https://enter.tochka.com/uapi";
const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_RATE_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1_000;

export class TochkaApiError extends Error {
  readonly status: number;
  readonly errorCode?: string;

  constructor(message: string, status: number, errorCode?: string) {
    super(message);
    this.name = "TochkaApiError";
    this.status = status;
    this.errorCode = errorCode;
  }
}

export interface TochkaClientOptions {
  auth: AuthProvider;
  baseUrl?: string;
  timeoutMs?: number;
  /** Sent as the `customer-code` header on every request when provided. */
  customerCode?: string;
  /** Max time to wait for an async statement to become Ready. */
  statementTimeoutMs?: number;
}

interface RequestOptions {
  body?: unknown;
  query?: Record<string, string | undefined>;
  customerCode?: string;
  authRetried?: boolean;
  rateAttempt?: number;
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Pull the `Data` payload out of a Tochka envelope; pass through if absent. */
export function unwrap<T>(value: unknown): T {
  if (value && typeof value === "object" && "Data" in value) {
    return (value as TochkaEnvelope<T>).Data;
  }
  return value as T;
}

/** Resolve the retry delay from a Retry-After header, else exponential backoff + jitter. */
export function retryDelayMs(retryAfter: string | null, attempt: number): number {
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
    const when = Date.parse(retryAfter);
    if (!Number.isNaN(when)) return Math.max(0, when - Date.now());
  }
  const backoff = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
  return backoff + Math.floor(Math.random() * 250);
}

/** Build a redacted TochkaApiError from a response body that may use either casing. */
export function parseApiError(status: number, body: string): TochkaApiError {
  let code: string | undefined;
  let message: string | undefined;
  try {
    const j = JSON.parse(body) as Record<string, unknown>;
    message = (j.message ?? j.Message) as string | undefined;
    const errs = (j.Errors ?? j.errors) as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(errs) && errs[0]) {
      code = (errs[0].errorCode ?? errs[0].ErrorCode) as string | undefined;
      message = message ?? ((errs[0].message ?? errs[0].Message) as string | undefined);
    }
    if (!code && typeof j.code === "string") code = j.code;
    if (!code && typeof j.Code === "string") code = j.Code;
  } catch {
    // Body was not JSON; fall through to the redacted raw text.
  }
  const detail = message ? redact(message) : redact(body).slice(0, 300);
  return new TochkaApiError(
    `Tochka API error ${status}${code ? ` [${code}]` : ""}: ${detail}`,
    status,
    code,
  );
}

async function safeText(resp: Response): Promise<string> {
  try {
    return await resp.text();
  } catch {
    return "";
  }
}

export class TochkaBankClient {
  private readonly auth: AuthProvider;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly customerCode?: string;
  private readonly statementTimeoutMs: number;

  constructor(opts: TochkaClientOptions) {
    this.auth = opts.auth;
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.customerCode = opts.customerCode;
    this.statementTimeoutMs =
      opts.statementTimeoutMs ?? Number(process.env.TOCHKA_STATEMENT_TIMEOUT_MS ?? 25_000);
  }

  private buildUrl(path: string, query?: Record<string, string | undefined>): string {
    const url = new URL(this.baseUrl + path);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) url.searchParams.set(key, value);
      }
    }
    return url.toString();
  }

  private async request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
    const token = await this.auth.getAccessToken();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };
    const customerCode = opts.customerCode ?? this.customerCode;
    if (customerCode) headers["customer-code"] = customerCode;
    if (opts.body !== undefined) headers["Content-Type"] = "application/json";

    let resp: Response;
    try {
      resp = await fetch(this.buildUrl(path, opts.query), {
        method,
        headers,
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (err) {
      if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
        throw new TochkaApiError(`Tochka request timed out after ${this.timeoutMs}ms`, 0);
      }
      throw new TochkaApiError(
        `Tochka request failed: ${redact(err instanceof Error ? err.message : String(err))}`,
        0,
      );
    }

    if (resp.status === 401 && !opts.authRetried) {
      this.auth.invalidate();
      return this.request<T>(method, path, { ...opts, authRetried: true });
    }

    if (resp.status === 429) {
      const attempt = opts.rateAttempt ?? 1;
      if (attempt <= MAX_RATE_RETRIES) {
        await sleep(retryDelayMs(resp.headers.get("retry-after"), attempt));
        return this.request<T>(method, path, { ...opts, rateAttempt: attempt + 1 });
      }
    }

    if (!resp.ok) {
      throw parseApiError(resp.status, await safeText(resp));
    }
    if (resp.status === 204) return undefined as T;
    return (await resp.json()) as T;
  }

  private async data<TData>(
    method: string,
    path: string,
    opts: RequestOptions = {},
  ): Promise<TData> {
    const env = await this.request<TochkaEnvelope<TData>>(method, path, opts);
    return unwrap<TData>(env);
  }

  // ---- Accounts / balances ----

  async listAccounts(): Promise<Account[]> {
    const data = await this.data<{ Account?: Account[] }>("GET", "/open-banking/v1.0/accounts");
    return data.Account ?? [];
  }

  async getAccount(accountId: string): Promise<Account> {
    const data = await this.data<{ Account?: Account } | Account>(
      "GET",
      `/open-banking/v1.0/accounts/${encodeURIComponent(accountId)}`,
    );
    return (data as { Account?: Account }).Account ?? (data as Account);
  }

  async getAccountBalances(accountId: string): Promise<Balance[]> {
    const data = await this.data<{ Balance?: Balance[] }>(
      "GET",
      `/open-banking/v1.0/accounts/${encodeURIComponent(accountId)}/balances`,
    );
    return data.Balance ?? [];
  }

  async listBalances(): Promise<Balance[]> {
    const data = await this.data<{ Balance?: Balance[] }>("GET", "/open-banking/v1.0/balances");
    return data.Balance ?? [];
  }

  // ---- Statements (async: init -> poll) ----

  async initStatement(
    accountId: string,
    startDateTime: string,
    endDateTime: string,
  ): Promise<Statement> {
    const data = await this.data<{ Statement: Statement }>(
      "POST",
      "/open-banking/v1.0/statements",
      { body: { Data: { Statement: { accountId, startDateTime, endDateTime } } } },
    );
    return data.Statement;
  }

  async getStatement(accountId: string, statementId: string): Promise<Statement[]> {
    const data = await this.data<{ Statement: Statement | Statement[] }>(
      "GET",
      `/open-banking/v1.0/accounts/${encodeURIComponent(accountId)}/statements/${encodeURIComponent(statementId)}`,
    );
    const s = data.Statement;
    return Array.isArray(s) ? s : s ? [s] : [];
  }

  /** Init a statement, then poll until it is Ready/Error or the deadline passes. */
  async getStatementBlocking(
    accountId: string,
    startDateTime: string,
    endDateTime: string,
    opts: { maxWaitMs?: number; pollIntervalMs?: number } = {},
  ): Promise<{ status: string; statementId?: string; statements: Statement[] }> {
    const init = await this.initStatement(accountId, startDateTime, endDateTime);
    const statementId = init.statementId;
    let status = init.status ?? "Created";
    if (!statementId) return { status, statements: [] };

    const maxWaitMs = opts.maxWaitMs ?? this.statementTimeoutMs;
    const pollIntervalMs = opts.pollIntervalMs ?? 1_500;
    const deadline = Date.now() + maxWaitMs;

    while (Date.now() < deadline) {
      const statements = await this.getStatement(accountId, statementId);
      status = statements[0]?.status ?? status;
      if (status === "Ready" || status === "Error") {
        return { status, statementId, statements };
      }
      await sleep(pollIntervalMs);
    }
    return { status, statementId, statements: [] };
  }

  // ---- Customers ----

  async listCustomers(): Promise<Customer[]> {
    const data = await this.data<{ Customer?: Customer[] }>("GET", "/open-banking/v1.0/customers");
    return data.Customer ?? [];
  }

  async getCustomer(customerCode: string): Promise<Customer> {
    const data = await this.data<{ Customer?: Customer } | Customer>(
      "GET",
      `/open-banking/v1.0/customers/${encodeURIComponent(customerCode)}`,
    );
    return (data as { Customer?: Customer }).Customer ?? (data as Customer);
  }

  // ---- Payments ----

  async createPaymentForSign(req: PaymentForSignRequest): Promise<PaymentForSignResult> {
    const data = await this.data<{ requestId: string }>("POST", "/payment/v1.0/for-sign", {
      body: { Data: req },
    });
    return { requestId: data.requestId };
  }

  async getPaymentStatus(requestId: string): Promise<PaymentStatusResult> {
    const data = await this.data<{
      requestId?: string;
      status?: string;
      errors?: unknown[];
      Errors?: unknown[];
    }>("GET", `/payment/v1.0/status/${encodeURIComponent(requestId)}`);
    return {
      requestId: data.requestId,
      status: data.status,
      errors: data.errors ?? data.Errors,
    };
  }
}
