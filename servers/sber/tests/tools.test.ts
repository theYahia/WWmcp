import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";

// Mock fetch globally before imports
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Set env so client doesn't throw
process.env.SBER_TOKEN = "test-token-123";

describe("accounts tools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handleGetAccounts calls correct endpoint", async () => {
    const { handleGetAccounts } = await import("../src/tools/accounts.js");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accounts: [{ id: "1", number: "40817", currency: "RUB", balance: 1000 }] }),
    });

    const result = await handleGetAccounts();
    const parsed = JSON.parse(result);

    expect(mockFetch).toHaveBeenCalledOnce();
    expect(mockFetch.mock.calls[0][0]).toContain("/fintech/v1/accounts");
    expect(parsed.accounts).toHaveLength(1);
    expect(parsed.accounts[0].balance).toBe(1000);
  });

  it("handleGetBalance calls correct endpoint with account_id", async () => {
    const { handleGetBalance } = await import("../src/tools/accounts.js");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ amount: 50000, currency: "RUB" }),
    });

    const result = await handleGetBalance({ account_id: "acc-123" });
    const parsed = JSON.parse(result);

    expect(mockFetch.mock.calls[0][0]).toContain("/fintech/v1/accounts/acc-123/balance");
    expect(parsed.amount).toBe(50000);
  });
});

describe("transactions tools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handleGetStatement builds query params correctly", async () => {
    const { handleGetStatement } = await import("../src/tools/transactions.js");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        transactions: [{ id: "tx1", date: "2026-03-01", amount: -500, currency: "RUB", type: "debit" }],
        account: "acc-1",
        dateFrom: "2026-03-01",
        dateTo: "2026-03-31",
      }),
    });

    const result = await handleGetStatement({
      account_id: "acc-1",
      date_from: "2026-03-01",
      date_to: "2026-03-31",
    });
    const parsed = JSON.parse(result);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("accountId=acc-1");
    expect(url).toContain("dateFrom=2026-03-01");
    expect(url).toContain("dateTo=2026-03-31");
    expect(parsed.transactions).toHaveLength(1);
  });

  it("handleGetStatement works without optional dates", async () => {
    const { handleGetStatement } = await import("../src/tools/transactions.js");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        transactions: [],
        account: "acc-1",
        dateFrom: "",
        dateTo: "",
      }),
    });

    const result = await handleGetStatement({ account_id: "acc-1" });
    const parsed = JSON.parse(result);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).not.toContain("dateFrom");
    expect(parsed.transactions).toHaveLength(0);
  });
});

describe("payments tools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handleCreatePayment sends POST with body", async () => {
    const { handleCreatePayment } = await import("../src/tools/payments.js");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ paymentId: "pay-1", status: "CREATED", createdAt: "2026-03-31T10:00:00Z" }),
    });

    const result = await handleCreatePayment({
      payer_account: "40817",
      payee_account: "40702",
      payee_name: "ООО Тест",
      payee_bank_bic: "044525225",
      amount: 15000,
      currency: "RUB",
      purpose: "Оплата по договору",
    });
    const parsed = JSON.parse(result);

    expect(mockFetch.mock.calls[0][0]).toContain("/fintech/v1/payments");
    const init = mockFetch.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(parsed.paymentId).toBe("pay-1");
  });

  it("handleGetPaymentStatus calls correct endpoint", async () => {
    const { handleGetPaymentStatus } = await import("../src/tools/payments.js");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ paymentId: "pay-1", status: "EXECUTED", updatedAt: "2026-03-31T12:00:00Z" }),
    });

    const result = await handleGetPaymentStatus({ payment_id: "pay-1" });
    const parsed = JSON.parse(result);

    expect(mockFetch.mock.calls[0][0]).toContain("/fintech/v1/payments/pay-1");
    expect(parsed.status).toBe("EXECUTED");
  });
});

describe("client auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses SBER_TOKEN for auth header", async () => {
    const { sberFetch } = await import("../src/client.js");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    await sberFetch("/test");

    const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer test-token-123");
  });
});

describe("idempotency (RqUID)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create_payment sends x-Introspect-RqUID + body rq_uid, reused across retries", async () => {
    const { handleCreatePayment } = await import("../src/tools/payments.js");

    // First attempt fails with 5xx (retried), second succeeds.
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 503, statusText: "Service Unavailable" })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ paymentId: "pay-1", status: "CREATED" }),
      });

    const result = await handleCreatePayment({
      payer_account: "40817",
      payee_account: "40702",
      payee_name: "ООО Тест",
      payee_bank_bic: "044525225",
      amount: 15000,
      currency: "RUB",
      purpose: "Оплата по договору",
    });

    expect(JSON.parse(result).paymentId).toBe("pay-1");
    expect(mockFetch).toHaveBeenCalledTimes(2);

    const h0 = mockFetch.mock.calls[0][1].headers as Record<string, string>;
    const h1 = mockFetch.mock.calls[1][1].headers as Record<string, string>;
    expect(h0["x-Introspect-RqUID"]).toMatch(/^[0-9a-f]{32}$/);
    // The SAME key is reused on the retry — otherwise Sber would create a duplicate payment.
    expect(h1["x-Introspect-RqUID"]).toBe(h0["x-Introspect-RqUID"]);

    // Body carries rq_uid matching the header.
    const body0 = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body0.rq_uid).toBe(h0["x-Introspect-RqUID"]);
  });

  it("GET requests carry no RqUID", async () => {
    const { handleGetAccounts } = await import("../src/tools/accounts.js");
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ accounts: [] }) });
    await handleGetAccounts();
    const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
    expect(headers["x-Introspect-RqUID"]).toBeUndefined();
  });
});

describe("summarize_transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aggregates income/expense/net/count", async () => {
    const { handleSummarizeTransactions } = await import("../src/tools/transactions.js");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        transactions: [
          { id: "1", date: "2026-05-02", amount: 1000, currency: "RUB", type: "credit" },
          { id: "2", date: "2026-05-03", amount: -300, currency: "RUB", type: "debit" },
          { id: "3", date: "2026-05-04", amount: -200, currency: "RUB", type: "debit" },
        ],
        account: "acc-1",
        dateFrom: "2026-05-01",
        dateTo: "2026-05-31",
      }),
    });

    const parsed = JSON.parse(
      await handleSummarizeTransactions({ account_id: "acc-1" }),
    );
    expect(parsed.count).toBe(3);
    expect(parsed.totalIncome).toBe(1000);
    expect(parsed.totalExpense).toBe(500);
    expect(parsed.net).toBe(500);
    expect(parsed.currency).toBe("RUB");
  });
});

describe("statement pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("get_statement adds page param when provided", async () => {
    const { handleGetStatement } = await import("../src/tools/transactions.js");
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ transactions: [] }) });
    await handleGetStatement({ account_id: "acc-1", page: 2 });
    expect(mockFetch.mock.calls[0][0] as string).toContain("page=2");
  });
});

describe("counterparties & company tools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("list_counterparties calls the counterparties endpoint", async () => {
    const { handleListCounterparties } = await import("../src/tools/counterparties.js");
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ counterparties: [] }) });
    await handleListCounterparties();
    expect(mockFetch.mock.calls[0][0] as string).toContain("/fintech/v1/counterparties");
  });

  it("get_company_info calls the client-info endpoint", async () => {
    const { handleGetCompanyInfo } = await import("../src/tools/company.js");
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ inn: "7700000000" }) });
    await handleGetCompanyInfo();
    expect(mockFetch.mock.calls[0][0] as string).toContain("/fintech/v1/client-info");
  });
});

describe("MCP server", () => {
  it("createMcpServer registers 8 tools and exposes TOOL_COUNT", async () => {
    const { createMcpServer, TOOL_COUNT } = await import("../src/server.js");
    expect(TOOL_COUNT).toBe(8);
    const server = createMcpServer();
    expect(server).toBeDefined();
  });

  it("VERSION is single-sourced from package.json", async () => {
    const { VERSION } = await import("../src/server.js");
    const pkg = JSON.parse(
      readFileSync(new URL("../package.json", import.meta.url), "utf8"),
    ) as { version: string };
    expect(VERSION).toBe(pkg.version);
  });
});
