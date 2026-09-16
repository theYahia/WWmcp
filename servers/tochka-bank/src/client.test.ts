import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseApiError, retryDelayMs, TochkaBankClient, unwrap } from "./client.js";
import type { AuthProvider } from "./types.js";

const BASE = "https://enter.tochka.com/uapi";

function res(opts: {
  status?: number;
  ok?: boolean;
  json?: unknown;
  text?: string;
  headers?: Record<string, string>;
}): Response {
  const status = opts.status ?? 200;
  const headers = opts.headers ?? {};
  return {
    ok: opts.ok ?? (status >= 200 && status < 300),
    status,
    headers: { get: (k: string) => headers[k.toLowerCase()] ?? null },
    json: async () => opts.json,
    text: async () => opts.text ?? (opts.json !== undefined ? JSON.stringify(opts.json) : ""),
  } as unknown as Response;
}

function stubAuth(token = "tok"): AuthProvider & { invalidate: ReturnType<typeof vi.fn> } {
  return { getAccessToken: async () => token, invalidate: vi.fn() };
}

describe("TochkaBankClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("lists accounts unwrapping the Data.Account envelope", async () => {
    const client = new TochkaBankClient({ auth: stubAuth() });
    const accounts = [{ accountId: "acc1", currency: "RUB" }];
    const fm = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(res({ json: { Data: { Account: accounts }, Links: {}, Meta: {} } }));

    const result = await client.listAccounts();

    expect(result).toEqual(accounts);
    expect(fm.mock.calls[0][0]).toBe(`${BASE}/open-banking/v1.0/accounts`);
    expect((fm.mock.calls[0][1] as RequestInit).headers).toMatchObject({
      Authorization: "Bearer tok",
    });
  });

  it("reads balances from the plural /balances path", async () => {
    const client = new TochkaBankClient({ auth: stubAuth() });
    const balances = [{ type: "ClosingAvailable", Amount: { amount: 250000, currency: "RUB" } }];
    const fm = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(res({ json: { Data: { Balance: balances } } }));

    const result = await client.getAccountBalances("acc1");

    expect(result).toEqual(balances);
    expect(fm.mock.calls[0][0]).toBe(`${BASE}/open-banking/v1.0/accounts/acc1/balances`);
  });

  it("encodes path segments to prevent injection", async () => {
    const client = new TochkaBankClient({ auth: stubAuth() });
    const fm = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(res({ json: { Data: { Balance: [] } } }));

    await client.getAccountBalances("a/b?c");

    expect(fm.mock.calls[0][0]).toBe(`${BASE}/open-banking/v1.0/accounts/a%2Fb%3Fc/balances`);
  });

  it("re-auths exactly once on 401", async () => {
    const auth = stubAuth();
    const client = new TochkaBankClient({ auth });
    const fm = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(res({ status: 401, text: "unauthorized" }))
      .mockResolvedValueOnce(res({ json: { Data: { Account: [] } } }));

    const result = await client.listAccounts();

    expect(result).toEqual([]);
    expect(auth.invalidate).toHaveBeenCalledTimes(1);
    expect(fm).toHaveBeenCalledTimes(2);
  });

  it("retries on 429 honoring Retry-After", async () => {
    const client = new TochkaBankClient({ auth: stubAuth() });
    const fm = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(res({ status: 429, headers: { "retry-after": "0" }, text: "rate" }))
      .mockResolvedValueOnce(res({ json: { Data: { Account: [] } } }));

    const result = await client.listAccounts();

    expect(result).toEqual([]);
    expect(fm).toHaveBeenCalledTimes(2);
  });

  it("throws a TochkaApiError carrying the error code", async () => {
    const client = new TochkaBankClient({ auth: stubAuth() });
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      res({
        status: 400,
        text: JSON.stringify({
          Code: 400,
          Message: "REQUEST_VALIDATION_ERROR",
          Errors: [{ ErrorCode: "BAD", Message: "bad field" }],
        }),
      }),
    );

    await expect(client.listAccounts()).rejects.toThrow("[BAD]");
  });

  it("times out cleanly", async () => {
    const client = new TochkaBankClient({ auth: stubAuth(), timeoutMs: 5 });
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      Object.assign(new Error("aborted"), { name: "TimeoutError" }),
    );

    await expect(client.listAccounts()).rejects.toThrow(/timed out/);
  });

  it("creates a for-sign payment with the correct Data-wrapped body", async () => {
    const client = new TochkaBankClient({ auth: stubAuth() });
    const fm = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(res({ json: { Data: { requestId: "req1" } } }));

    const result = await client.createPaymentForSign({
      accountCode: "40702810000000001234",
      counterpartyAccountNumber: "40702810000000005678",
      counterpartyBankBic: "044525225",
      counterpartyName: "OOO Test",
      paymentAmount: 75000.5,
      paymentDate: "2026-06-23",
      paymentPurpose: "services",
    });

    expect(result.requestId).toBe("req1");
    expect(fm.mock.calls[0][0]).toBe(`${BASE}/payment/v1.0/for-sign`);
    const body = JSON.parse((fm.mock.calls[0][1] as RequestInit).body as string);
    expect(body).toEqual({
      Data: {
        accountCode: "40702810000000001234",
        counterpartyAccountNumber: "40702810000000005678",
        counterpartyBankBic: "044525225",
        counterpartyName: "OOO Test",
        paymentAmount: 75000.5,
        paymentDate: "2026-06-23",
        paymentPurpose: "services",
      },
    });
  });

  it("polls an async statement until Ready", async () => {
    const client = new TochkaBankClient({ auth: stubAuth() });
    const fm = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        res({ json: { Data: { Statement: { statementId: "s1", status: "Created" } } } }),
      )
      .mockResolvedValueOnce(
        res({
          json: {
            Data: {
              Statement: [{ statementId: "s1", status: "Ready", Transaction: [{ amount: 1 }] }],
            },
          },
        }),
      );

    const result = await client.getStatementBlocking("acc1", "2026-06-01", "2026-06-23", {
      maxWaitMs: 1000,
      pollIntervalMs: 1,
    });

    expect(result.status).toBe("Ready");
    expect(result.statements[0].Transaction).toHaveLength(1);
    expect(fm).toHaveBeenCalledTimes(2);
    expect(fm.mock.calls[0][0]).toBe(`${BASE}/open-banking/v1.0/statements`);
    expect(fm.mock.calls[1][0]).toBe(`${BASE}/open-banking/v1.0/accounts/acc1/statements/s1`);
  });
});

describe("retryDelayMs", () => {
  it("parses delta-seconds", () => {
    expect(retryDelayMs("2", 1)).toBe(2000);
  });
  it("parses an HTTP-date", () => {
    const date = new Date(Date.now() + 3000).toUTCString();
    const value = retryDelayMs(date, 1);
    expect(value).toBeGreaterThan(1000);
    expect(value).toBeLessThanOrEqual(3000);
  });
  it("falls back to exponential backoff", () => {
    const value = retryDelayMs(null, 1);
    expect(value).toBeGreaterThanOrEqual(1000);
    expect(value).toBeLessThan(1300);
  });
});

describe("parseApiError", () => {
  it("handles the PascalCase open-banking envelope", () => {
    const err = parseApiError(
      400,
      JSON.stringify({ Code: 400, Message: "M", Errors: [{ ErrorCode: "C", Message: "d" }] }),
    );
    expect(err.status).toBe(400);
    expect(err.errorCode).toBe("C");
  });
  it("handles the camelCase pay-gateway envelope", () => {
    const err = parseApiError(
      403,
      JSON.stringify({
        code: 403,
        message: "M",
        errors: [{ errorCode: "OPERATION_FORBIDDEN", message: "no" }],
      }),
    );
    expect(err.errorCode).toBe("OPERATION_FORBIDDEN");
  });
  it("redacts account numbers in non-JSON bodies", () => {
    const err = parseApiError(500, "failed for 40702810000000001234");
    expect(err.message).not.toContain("40702810000000001234");
  });
});

describe("unwrap", () => {
  it("returns Data when present", () => {
    expect(unwrap({ Data: { x: 1 } })).toEqual({ x: 1 });
  });
  it("passes through when absent", () => {
    expect(unwrap({ x: 1 })).toEqual({ x: 1 });
  });
});
