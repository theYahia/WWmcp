import { beforeEach, describe, expect, it, vi } from "vitest";
import { AlfaBankClient } from "../src/client.js";
import type { Signer } from "../src/auth/signer.js";

const mockConfig = {
  clientId: "test-client-id",
  clientSecret: "test-client-secret",
  baseUrl: "https://test.alfabank.ru",
};

// --- Response helpers ---------------------------------------------------------
// getAccessToken() reads resp.json(); request() reads resp.text().
function tokenOk(token = "tok123"): Response {
  return {
    ok: true,
    status: 200,
    json: async () => ({ access_token: token, token_type: "Bearer", expires_in: 3600 }),
  } as unknown as Response;
}
function dataOk(data: unknown): Response {
  return { ok: true, status: 200, text: async () => JSON.stringify(data) } as unknown as Response;
}
function httpFail(status: number, body = ""): Response {
  return { ok: false, status, text: async () => body, json: async () => ({}) } as unknown as Response;
}

describe("AlfaBankClient", () => {
  let client: AlfaBankClient;

  beforeEach(() => {
    client = new AlfaBankClient(mockConfig);
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("authenticates via /oidc/token and lists accounts at /api/pp/v1/accounts", async () => {
    const accounts = [{ id: "acc1", number: "40702810000000001234", currency: "RUB" }];
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(tokenOk())
      .mockResolvedValueOnce(dataOk(accounts));

    const result = await client.listAccounts();

    expect(result).toEqual(accounts);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(String(spy.mock.calls[0][0])).toContain("/oidc/token");
    expect(String(spy.mock.calls[1][0])).toContain("/api/pp/v1/accounts");
  });

  it("gets account balance", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(tokenOk())
      .mockResolvedValueOnce(dataOk({ accountId: "acc1", amount: 150000, currency: "RUB" }));

    const balance = await client.getAccountBalance("acc1");
    expect(balance.amount).toBe(150000);
  });

  it("sends statement request to /api/statement/transactions with accountNumber", async () => {
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(tokenOk())
      .mockResolvedValueOnce(dataOk({ entries: [] }));

    await client.getAccountStatement("40702810000000001234", "2026-03-01", "2026-03-31");
    const url = String(spy.mock.calls[1][0]);
    expect(url).toContain("/api/statement/transactions");
    expect(url).toContain("accountNumber=40702810000000001234");
  });

  it("retries on 429 then succeeds", async () => {
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(tokenOk())
      .mockResolvedValueOnce(httpFail(429, "Rate limited"))
      .mockResolvedValueOnce(dataOk([]));

    vi.useFakeTimers();
    const promise = client.listAccounts();
    await vi.runAllTimersAsync();

    expect(await promise).toEqual([]);
    expect(spy).toHaveBeenCalledTimes(3); // token + 429 + ok (token cached on retry)
  });

  it("re-authenticates once on 401", async () => {
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(tokenOk("tok-old"))
      .mockResolvedValueOnce(httpFail(401, "Unauthorized"))
      .mockResolvedValueOnce(tokenOk("tok-new"))
      .mockResolvedValueOnce(dataOk([{ id: "acc1" }]));

    const result = await client.listAccounts();
    expect(result).toEqual([{ id: "acc1" }]);
    expect(spy).toHaveBeenCalledTimes(4);
  });

  it("throws a mapped message on a non-retryable HTTP error (400)", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(tokenOk())
      .mockResolvedValueOnce(httpFail(400, "bad input"));

    await expect(client.listAccounts()).rejects.toThrow("Bad request");
  });

  it("throws on auth failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(httpFail(401, "Invalid credentials"));
    await expect(client.listAccounts()).rejects.toThrow("Auth failed");
  });

  it("never leaks the client secret in error messages", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(httpFail(401, "Invalid credentials"));
    await expect(client.listAccounts()).rejects.not.toThrow(/test-client-secret/);
  });

  it("refuses to create a payment without a real signer (no network call)", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    await expect(
      client.createPaymentOrder({
        fromAccount: "40702810000000001234",
        toAccount: "40702810000000005678",
        toBik: "044525225",
        amount: 50000,
        purpose: "Test payment",
      }),
    ).rejects.toThrow(/GOST request signing is not implemented/);
    expect(spy).not.toHaveBeenCalled();
  });

  it("creates a payment and attaches X-Alfabank-Signature when a signer is injected", async () => {
    const signer: Signer = { sign: () => "sig-123" };
    const signed = new AlfaBankClient({ ...mockConfig, signer });

    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(tokenOk())
      .mockResolvedValueOnce(dataOk({ id: "reg1", status: "CREATED" }));

    const order = await signed.createPaymentOrder({
      fromAccount: "40702810000000001234",
      toAccount: "40702810000000005678",
      toBik: "044525225",
      amount: 50000,
      purpose: "Test payment",
    });

    expect(order.status).toBe("CREATED");
    const init = spy.mock.calls[1][1] as RequestInit;
    expect(String(spy.mock.calls[1][0])).toContain("/api/jp/v1/registries");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["X-Alfabank-Signature"]).toBe("sig-123");
  });

  it("times out and surfaces a timeout error", async () => {
    const abort = Object.assign(new Error("aborted"), { name: "AbortError" });
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(tokenOk()).mockRejectedValue(abort);

    vi.useFakeTimers();
    const promise = client.listAccounts();
    const assertion = expect(promise).rejects.toThrow(/timed out/);
    await vi.runAllTimersAsync();
    await assertion;
  });

  // A timeout or 5xx does not mean the bank skipped the registry — a repeat pays twice.
  const order = {
    fromAccount: "40702810000000001234",
    toAccount: "40702810000000005678",
    toBik: "044525225",
    amount: 50000,
    purpose: "Test payment",
  };

  it("never repeats a payment submission after a timeout", async () => {
    const signed = new AlfaBankClient({ ...mockConfig, signer: { sign: () => "sig-123" } });
    const abort = Object.assign(new Error("aborted"), { name: "AbortError" });
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(tokenOk()).mockRejectedValue(abort);

    await expect(signed.createPaymentOrder(order)).rejects.toThrow(/Not retried automatically/);
    expect(spy).toHaveBeenCalledTimes(2); // token + exactly one POST
  });

  it("never repeats a payment submission after a 5xx", async () => {
    const signed = new AlfaBankClient({ ...mockConfig, signer: { sign: () => "sig-123" } });
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(tokenOk())
      .mockResolvedValue(httpFail(503, "busy"));

    await expect(signed.createPaymentOrder(order)).rejects.toThrow(/Not retried automatically/);
    expect(spy).toHaveBeenCalledTimes(2); // token + exactly one POST
  });
});
