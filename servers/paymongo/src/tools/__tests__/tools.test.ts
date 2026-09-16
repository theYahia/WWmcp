import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;
process.env.PAYMONGO_SECRET_KEY = "test-secret-key";

describe("paymongo-mcp tools", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("create_payment_intent creates intent", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: "pi_123", attributes: { status: "awaiting_payment_method", amount: 10000 } } }) });
    const { handleCreatePaymentIntent } = await import("../create-payment-intent.js");
    const result = await handleCreatePaymentIntent({ amount: 10000, currency: "PHP", payment_method_allowed: ["card", "gcash"] });
    expect(JSON.parse(result).data.id).toBe("pi_123");
  });

  it("get_payment_intent retrieves intent", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: "pi_123", attributes: { status: "succeeded" } } }) });
    const { handleGetPaymentIntent } = await import("../get-payment-intent.js");
    const result = await handleGetPaymentIntent({ payment_intent_id: "pi_123" });
    expect(JSON.parse(result).data.attributes.status).toBe("succeeded");
  });

  it("create_source creates GCash source", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: "src_123", attributes: { type: "gcash", redirect: { checkout_url: "https://gcash.com/pay" } } } }) });
    const { handleCreateSource } = await import("../create-source.js");
    const result = await handleCreateSource({ amount: 5000, type: "gcash", currency: "PHP", redirect_success: "https://ex.com/ok", redirect_failed: "https://ex.com/fail" });
    expect(JSON.parse(result).data.attributes.type).toBe("gcash");
  });

  it("get_source retrieves source", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: "src_123", attributes: { status: "chargeable" } } }) });
    const { handleGetSource } = await import("../get-source.js");
    const result = await handleGetSource({ source_id: "src_123" });
    expect(JSON.parse(result).data.attributes.status).toBe("chargeable");
  });

  it("create_payment charges source", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: "pay_123", attributes: { status: "paid", amount: 5000 } } }) });
    const { handleCreatePayment } = await import("../create-payment.js");
    const result = await handleCreatePayment({ amount: 5000, currency: "PHP", source_id: "src_123" });
    expect(JSON.parse(result).data.attributes.status).toBe("paid");
  });

  it("list_payments returns list", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: [{ id: "pay_1" }, { id: "pay_2" }] }) });
    const { handleListPayments } = await import("../list-payments.js");
    const result = await handleListPayments({ limit: 10 });
    expect(JSON.parse(result).data).toHaveLength(2);
  });

  it("create_refund processes refund", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: "ref_123", attributes: { status: "pending", amount: 2500 } } }) });
    const { handleCreateRefund } = await import("../create-refund.js");
    const result = await handleCreateRefund({ payment_id: "pay_123", amount: 2500, reason: "requested_by_customer" });
    expect(JSON.parse(result).data.attributes.amount).toBe(2500);
  });

  it("create_checkout creates session", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: "cs_123", attributes: { checkout_url: "https://checkout.paymongo.com/cs_123" } } }) });
    const { handleCreateCheckout } = await import("../create-checkout.js");
    const result = await handleCreateCheckout({ amount: 10000, currency: "PHP", success_url: "https://ex.com/ok", cancel_url: "https://ex.com/cancel", payment_method_types: ["card"] });
    expect(JSON.parse(result).data.attributes.checkout_url).toContain("paymongo.com");
  });

  it("get_checkout retrieves session", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: "cs_123", attributes: { status: "active" } } }) });
    const { handleGetCheckout } = await import("../get-checkout.js");
    const result = await handleGetCheckout({ checkout_session_id: "cs_123" });
    expect(JSON.parse(result).data.attributes.status).toBe("active");
  });

  it("handles HTTP errors gracefully", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 422, text: async () => "Unprocessable Entity" });
    const { handleGetPaymentIntent } = await import("../get-payment-intent.js");
    await expect(handleGetPaymentIntent({ payment_intent_id: "bad" })).rejects.toThrow("PayMongo HTTP 422");
  });
});
