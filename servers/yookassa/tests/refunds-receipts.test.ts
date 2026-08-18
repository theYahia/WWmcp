import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.YOOKASSA_SHOP_ID = "test_shop_123";
process.env.YOOKASSA_SECRET_KEY = "test_secret_key";

import { handleCreateRefund, handleGetRefund, handleListRefunds } from "../src/tools/refunds.js";
import { handleCreateReceipt, handleListReceipts } from "../src/tools/receipts.js";
import { handleGetBalance } from "../src/tools/balance.js";
import { handleCreatePayout, handleGetPayout } from "../src/tools/payouts.js";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

function mockOk(data: unknown) {
  return { ok: true, status: 200, json: async () => data, text: async () => JSON.stringify(data) };
}

beforeEach(() => { mockFetch.mockReset(); });

describe("refunds", () => {
  it("creates a refund", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ id: "ref_1", status: "succeeded", amount: { value: "500.00", currency: "RUB" } }));

    const result = JSON.parse(await handleCreateRefund({ payment_id: "pay_1", amount: 500 }));
    expect(result.status).toBe("succeeded");

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.payment_id).toBe("pay_1");
    expect(body.amount.value).toBe("500.00");
  });

  it("gets a refund", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ id: "ref_1", status: "succeeded" }));
    const result = JSON.parse(await handleGetRefund({ refund_id: "ref_1" }));
    expect(result.id).toBe("ref_1");
  });

  it("lists refunds", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ type: "list", items: [{ id: "ref_1" }] }));
    const result = JSON.parse(await handleListRefunds({ limit: 10 }));
    expect(result.items).toHaveLength(1);
  });

  it("surfaces a YooKassa error on a missing refund", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({}),
      text: async () => JSON.stringify({ type: "error", id: "e", code: "not_found", description: "Refund not found" }),
    });
    await expect(handleGetRefund({ refund_id: "nope" })).rejects.toThrow("Refund not found");
  });
});

describe("receipts", () => {
  it("creates a receipt", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ id: "rc_1", type: "payment", status: "pending" }));

    const result = JSON.parse(await handleCreateReceipt({
      type: "payment",
      payment_id: "pay_1",
      customer_email: "buyer@test.com",
      send: true,
      items: [{ description: "Service", quantity: 2, amount: 1000, vat_code: 4 }],
    }));

    expect(result.id).toBe("rc_1");
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.customer.email).toBe("buyer@test.com");
    expect(body.send).toBe(true);
    expect(body.items[0].amount.value).toBe("1000.00");
    // 54-FZ fiscal attributes with defaults
    expect(body.items[0].payment_subject).toBe("commodity");
    expect(body.items[0].payment_mode).toBe("full_payment");
    expect(body.items[0].measure).toBe("piece");
    // settlements auto-computed: 2 x 1000.00 = 2000.00, cashless
    expect(body.settlements).toEqual([{ type: "cashless", amount: { value: "2000.00", currency: "RUB" } }]);
  });

  it("honors explicit fiscal attributes and tax_system_code", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ id: "rc_2" }));
    await handleCreateReceipt({
      type: "payment",
      payment_id: "pay_2",
      customer_email: "b@test.com",
      send: true,
      tax_system_code: 2,
      items: [{ description: "Consult", quantity: 1, amount: 5000, vat_code: 1, payment_subject: "service", payment_mode: "full_prepayment", measure: "piece" }],
    });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.tax_system_code).toBe(2);
    expect(body.items[0].payment_subject).toBe("service");
    expect(body.items[0].payment_mode).toBe("full_prepayment");
  });

  it("lists receipts", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ type: "list", items: [{ id: "rc_1" }] }));
    const result = JSON.parse(await handleListReceipts({ limit: 10 }));
    expect(result.items).toHaveLength(1);
  });
});

describe("balance", () => {
  it("gets shop info", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ account_id: "123", test: true, status: "enabled" }));
    const result = JSON.parse(await handleGetBalance());
    expect(result.account_id).toBe("123");
  });
});

describe("payouts", () => {
  it("creates a payout", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ id: "po_1", status: "pending", amount: { value: "5000.00", currency: "RUB" } }));

    const result = JSON.parse(await handleCreatePayout({
      amount: 5000,
      currency: "RUB",
      destination_type: "bank_card",
      destination_value: "4111111111111111",
      description: "Payout to seller",
    }));

    expect(result.id).toBe("po_1");
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.amount.value).toBe("5000.00");
    expect(body.payout_destination_data.type).toBe("bank_card");
    // card must be a nested OBJECT { number }, not a JSON-encoded string
    expect(body.payout_destination_data.card).toEqual({ number: "4111111111111111" });
    expect(typeof body.payout_destination_data.card).toBe("object");
  });

  it("creates a yoo_money payout (account_number, flat)", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ id: "po_2", status: "pending" }));

    await handleCreatePayout({
      amount: 100,
      currency: "RUB",
      destination_type: "yoo_money",
      destination_value: "4100116075156746",
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.payout_destination_data).toEqual({ type: "yoo_money", account_number: "4100116075156746" });
  });

  it("creates an SBP payout with phone + bank_id", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ id: "po_3", status: "pending" }));

    await handleCreatePayout({
      amount: 100,
      currency: "RUB",
      destination_type: "sbp",
      destination_value: "79000000000",
      bank_id: "100000000111",
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.payout_destination_data).toEqual({ type: "sbp", phone: "79000000000", bank_id: "100000000111" });
  });

  it("rejects an SBP payout missing bank_id", async () => {
    await expect(handleCreatePayout({
      amount: 100,
      currency: "RUB",
      destination_type: "sbp",
      destination_value: "79000000000",
    })).rejects.toThrow("bank_id");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("creates a payout with payout_token (no raw card)", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ id: "po_4", status: "pending" }));
    await handleCreatePayout({
      amount: 100,
      currency: "RUB",
      payout_token: "uAFUv0jwtUA_8mMIFeRqzAYw.SC.001",
    });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.payout_token).toBe("uAFUv0jwtUA_8mMIFeRqzAYw.SC.001");
    expect(body.payout_destination_data).toBeUndefined();
  });

  it("rejects a payout with neither payout_token nor destination", async () => {
    await expect(handleCreatePayout({ amount: 100, currency: "RUB" })).rejects.toThrow(/payout_token/);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("rejects a payout with BOTH payout_token and a destination (mutually exclusive)", async () => {
    await expect(handleCreatePayout({
      amount: 100,
      currency: "RUB",
      payout_token: "tok_1",
      destination_type: "bank_card",
      destination_value: "4111111111111111",
    })).rejects.toThrow(/mutually exclusive/);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("gets a payout", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ id: "po_1", status: "succeeded" }));
    const result = JSON.parse(await handleGetPayout({ payout_id: "po_1" }));
    expect(result.status).toBe("succeeded");
  });
});
