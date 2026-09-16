import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

import { handleCreatePaymentIntent } from "../create-payment-intent.js";
import { handleCreateSource } from "../create-source.js";
import { handleCreatePayment } from "../create-payment.js";
import { handleCreateCheckout } from "../create-checkout.js";
import { handleCreateRefund } from "../create-refund.js";
import { handleCreateLink } from "../links.js";
import { handleCreatePaymentMethod } from "../payment-methods.js";
import { handleGetPaymentIntent } from "../get-payment-intent.js";
import { __resetClientForTests } from "../../client.js";

// Each money-moving tool must wire `moneyMoving: true` into client.request so a
// LIVE key is refused without PAYMONGO_ALLOW_LIVE. These tests pin that wiring
// at the TOOL level: dropping the flag from any handler breaks a test here.
const moneyMovers: [string, () => Promise<string>][] = [
  ["create_payment_intent", () =>
    handleCreatePaymentIntent({ amount: 10000, currency: "PHP", payment_method_allowed: ["card"] })],
  ["create_source", () =>
    handleCreateSource({ amount: 5000, type: "gcash", currency: "PHP", redirect_success: "https://a.com/ok", redirect_failed: "https://a.com/no" })],
  ["create_payment", () =>
    handleCreatePayment({ amount: 5000, currency: "PHP", source_id: "src_1" })],
  ["create_checkout", () =>
    handleCreateCheckout({ amount: 10000, currency: "PHP", payment_method_types: ["card"], success_url: "https://a.com/ok", cancel_url: "https://a.com/no" })],
  ["create_refund", () =>
    handleCreateRefund({ payment_id: "pay_1", amount: 2500, reason: "requested_by_customer" })],
  ["create_link", () =>
    handleCreateLink({ amount: 10000, description: "x", currency: "PHP" })],
  ["create_payment_method", () =>
    handleCreatePaymentMethod({ type: "card", details: { card_number: "4242424242424242", exp_month: 12, exp_year: 30, cvc: "123" } })],
];

describe("live-mode guard (per-tool wiring)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PAYMONGO_SECRET_KEY = "sk_live_test";
    delete process.env.PAYMONGO_ALLOW_LIVE;
    __resetClientForTests();
  });

  it.each(moneyMovers)(
    "%s is refused on a LIVE key without PAYMONGO_ALLOW_LIVE",
    async (_name, call) => {
      await expect(call()).rejects.toThrow(/LIVE secret key/);
      expect(mockFetch).not.toHaveBeenCalled();
    },
  );

  it("read tools are NOT blocked on a LIVE key", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: "pi_1" } }) });
    const result = await handleGetPaymentIntent({ payment_intent_id: "pi_1" });
    expect(JSON.parse(result).data.id).toBe("pi_1");
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("money-moving tools proceed on a LIVE key when PAYMONGO_ALLOW_LIVE=true", async () => {
    process.env.PAYMONGO_ALLOW_LIVE = "true";
    __resetClientForTests();
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: "link_live" } }) });
    const result = await handleCreateLink({ amount: 10000, description: "x", currency: "PHP" });
    expect(JSON.parse(result).data.id).toBe("link_live");
  });
});
