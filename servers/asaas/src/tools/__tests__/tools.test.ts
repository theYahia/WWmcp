import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

process.env.ASAAS_API_KEY = "test-key";

// core's BaseHttpClient reads the body via response.text() and parses JSON itself.
function mockJson(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    text: async () => JSON.stringify(data),
    headers: new Map([["content-type", "application/json"]]),
  });
}

function lastCall(): { url: string; init: RequestInit } {
  const [url, init] = mockFetch.mock.calls.at(-1)!;
  return { url: String(url), init: init as RequestInit };
}

describe("asaas-mcp tools", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("create_payment works", async () => {
    mockJson({ id: "pay_1", status: "PENDING" });
    const { handleCreatePayment } = await import("../create-payment.js");
    const result = await handleCreatePayment({ customer: "cus_1", billingType: "PIX", value: 100, dueDate: "2026-12-31" });
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe("PENDING");
    const { url, init } = lastCall();
    expect(url).toBe("https://api.asaas.com/v3/payments");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["access_token"]).toBe("test-key");
  });

  it("get_payment works", async () => {
    mockJson({ id: "pay_1", status: "RECEIVED" });
    const { handleGetPayment } = await import("../get-payment.js");
    const result = await handleGetPayment({ payment_id: "pay_1" });
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe("RECEIVED");
  });

  it("list_payments works", async () => {
    mockJson({ data: [{ id: "pay_1" }] });
    const { handleListPayments } = await import("../list-payments.js");
    const result = await handleListPayments({ page: 1, limit: 25 });
    const parsed = JSON.parse(result);
    expect(parsed.data).toHaveLength(1);
    expect(lastCall().url).toBe("https://api.asaas.com/v3/payments?page=1&limit=25");
  });

  it("create_pix_qr works", async () => {
    mockJson({ encodedImage: "base64...", payload: "00020126..." });
    const { handleCreatePixQr } = await import("../create-pix-qr.js");
    const result = await handleCreatePixQr({ payment_id: "pay_1" });
    const parsed = JSON.parse(result);
    expect(parsed.payload).toBeTruthy();
  });

  it("get_pix_status works", async () => {
    mockJson({ id: "pay_1", status: "RECEIVED" });
    const { handleGetPixStatus } = await import("../get-pix-status.js");
    const result = await handleGetPixStatus({ payment_id: "pay_1" });
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe("RECEIVED");
  });

  it("create_customer works", async () => {
    mockJson({ id: "cus_1", name: "Test" });
    const { handleCreateCustomer } = await import("../create-customer.js");
    const result = await handleCreateCustomer({ name: "Test", cpfCnpj: "12345678900" });
    const parsed = JSON.parse(result);
    expect(parsed.name).toBe("Test");
  });

  it("list_customers works", async () => {
    mockJson({ data: [{ id: "cus_1" }] });
    const { handleListCustomers } = await import("../list-customers.js");
    const result = await handleListCustomers({ page: 1, limit: 25 });
    const parsed = JSON.parse(result);
    expect(parsed.data).toHaveLength(1);
  });

  it("create_subscription works", async () => {
    mockJson({ id: "sub_1", status: "ACTIVE" });
    const { handleCreateSubscription } = await import("../create-subscription.js");
    const result = await handleCreateSubscription({ customer: "cus_1", billingType: "PIX", value: 50, cycle: "MONTHLY" });
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe("ACTIVE");
  });

  it("refund_payment works", async () => {
    mockJson({ id: "pay_1", status: "REFUNDED" });
    const { handleRefundPayment } = await import("../refund-payment.js");
    const result = await handleRefundPayment({ payment_id: "pay_1" });
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe("REFUNDED");
  });

  it("refund_payment encodes the id so it cannot reroute the POST", async () => {
    mockJson({});
    const { handleRefundPayment } = await import("../refund-payment.js");
    await handleRefundPayment({ payment_id: "x?a=" });
    expect(lastCall().url).toBe("https://api.asaas.com/v3/payments/x%3Fa%3D/refund");
  });

  it("handles HTTP errors and keeps the Asaas error body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: async () => '{"errors":[{"description":"invalid key"}]}',
      headers: new Map(),
    });
    const { handleCreatePayment } = await import("../create-payment.js");
    await expect(handleCreatePayment({ customer: "cus_1", billingType: "PIX", value: 100, dueDate: "2026-12-31" }))
      .rejects.toThrow(/Asaas HTTP 401[\s\S]*invalid key/);
  });

  it("throws when ASAAS_API_KEY is missing, only on call", async () => {
    const saved = process.env.ASAAS_API_KEY;
    delete process.env.ASAAS_API_KEY;
    try {
      const { handleGetPayment } = await import("../get-payment.js");
      await expect(handleGetPayment({ payment_id: "pay_1" })).rejects.toThrow("ASAAS_API_KEY");
    } finally {
      process.env.ASAAS_API_KEY = saved;
    }
  });
});
