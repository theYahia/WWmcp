import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  handleCreatePayment, handleGetPayment, handleSearchPayments, handleRefundPayment,
  handleGetPaymentMethods,
} from "../src/tools/payments.js";
import {
  handleCreatePreference, handleGetPreference, handleUpdatePreference,
} from "../src/tools/preferences.js";
import {
  handleSearchMerchantOrders, handleGetMerchantOrder,
} from "../src/tools/merchant-orders.js";
import { resetClient } from "../src/client.js";

function mockFetchOk(data: unknown): ReturnType<typeof vi.fn> {
  const mock = vi.fn().mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Map(),
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

describe("mercadopago tools", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["MERCADOPAGO_ACCESS_TOKEN"] = "TEST-token";
    resetClient();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    resetClient();
  });

  it("create_payment posts to /v1/payments with correct shape", async () => {
    const fetch = mockFetchOk({ id: 12345, status: "approved" });
    await handleCreatePayment({
      transaction_amount: 1000,
      description: "Test order",
      payment_method_id: "visa",
      payer_email: "test@example.com",
      token: "card_token_123",
      installments: 3,
    });
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toBe("https://api.mercadopago.com/v1/payments");
    expect(opts.method).toBe("POST");
    const body = JSON.parse(opts.body);
    expect(body.transaction_amount).toBe(1000);
    expect(body.payer.email).toBe("test@example.com");
    expect(body.token).toBe("card_token_123");
    expect(body.installments).toBe(3);
  });

  it("get_payment GETs /v1/payments/:id", async () => {
    const fetch = mockFetchOk({ id: 999, status: "approved" });
    await handleGetPayment({ payment_id: "999" });
    expect(fetch.mock.calls[0][0]).toBe("https://api.mercadopago.com/v1/payments/999");
  });

  it("search_payments passes status + date range", async () => {
    const fetch = mockFetchOk({ results: [], paging: { total: 0 } });
    await handleSearchPayments({
      status: "approved",
      range: "date_created",
      begin_date: "2026-01-01T00:00:00Z",
      end_date: "2026-01-31T23:59:59Z",
      limit: 50,
      offset: 0,
    });
    const url = fetch.mock.calls[0][0];
    expect(url).toContain("/v1/payments/search");
    expect(url).toContain("status=approved");
    expect(url).toContain("limit=50");
  });

  it("refund_payment full refund (no amount)", async () => {
    const fetch = mockFetchOk({ id: "rfnd_1" });
    await handleRefundPayment({ payment_id: "999" });
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toContain("/v1/payments/999/refunds");
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({});
  });

  it("refund_payment partial refund", async () => {
    const fetch = mockFetchOk({ id: "rfnd_2" });
    await handleRefundPayment({ payment_id: "999", amount: 500 });
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ amount: 500 });
  });

  it("get_payment_methods has empty params", async () => {
    const fetch = mockFetchOk([{ id: "visa" }, { id: "master" }]);
    await handleGetPaymentMethods({});
    expect(fetch.mock.calls[0][0]).toBe("https://api.mercadopago.com/v1/payment_methods");
  });

  it("create_preference posts items + back_urls + auto_return", async () => {
    const fetch = mockFetchOk({ id: "pref_1", init_point: "https://mp.com/checkout/abc" });
    await handleCreatePreference({
      items: [{ title: "Book", quantity: 2, unit_price: 100 }],
      back_urls: { success: "https://x.com/ok" },
      auto_return: "approved",
      external_reference: "ORDER-1001",
    });
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.items[0].title).toBe("Book");
    expect(body.back_urls.success).toBe("https://x.com/ok");
    expect(body.auto_return).toBe("approved");
    expect(body.external_reference).toBe("ORDER-1001");
  });

  it("get_preference GETs /checkout/preferences/:id", async () => {
    const fetch = mockFetchOk({ id: "pref_1" });
    await handleGetPreference({ preference_id: "pref_1" });
    expect(fetch.mock.calls[0][0]).toBe("https://api.mercadopago.com/checkout/preferences/pref_1");
  });

  it("update_preference PUTs patch", async () => {
    const fetch = mockFetchOk({ id: "pref_1" });
    await handleUpdatePreference({
      preference_id: "pref_1",
      patch: { items: [{ title: "Updated", quantity: 1, unit_price: 200 }] },
    });
    const [, opts] = fetch.mock.calls[0];
    expect(opts.method).toBe("PUT");
    expect(JSON.parse(opts.body).items[0].title).toBe("Updated");
  });

  it("search_merchant_orders passes external_reference filter", async () => {
    const fetch = mockFetchOk({ elements: [] });
    await handleSearchMerchantOrders({
      external_reference: "ORDER-1001",
      limit: 30,
      offset: 0,
    });
    const url = fetch.mock.calls[0][0];
    expect(url).toContain("/merchant_orders/search");
    expect(url).toContain("external_reference=ORDER-1001");
  });

  it("get_merchant_order GETs /merchant_orders/:id", async () => {
    const fetch = mockFetchOk({ id: "MO-1" });
    await handleGetMerchantOrder({ merchant_order_id: "MO-1" });
    expect(fetch.mock.calls[0][0]).toBe("https://api.mercadopago.com/merchant_orders/MO-1");
  });
});
