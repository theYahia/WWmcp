import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createPaymentSchema, handleCreatePayment } from "../tools/create-payment.js";
import { checkPaymentStatusSchema } from "../tools/check-payment-status.js";
import { createMobileAccountPaymentSchema } from "../tools/create-mobile-account-payment.js";
import { refundPaymentSchema } from "../tools/refund-payment.js";
import { createVoucherSchema } from "../tools/create-voucher.js";
import { JazzCashClient, getClient, resetClient } from "../client.js";
import type { JazzCashResponse } from "../types.js";

/** Stub valid credentials and reset the shared client so handlers pick them up. */
function withCreds(salt = "test_salt") {
  vi.stubEnv("JAZZCASH_MERCHANT_ID", "test_merchant");
  vi.stubEnv("JAZZCASH_PASSWORD", "test_pass");
  vi.stubEnv("JAZZCASH_INTEGRITY_SALT", salt);
  resetClient();
}

function mockFetch(body: string, init: ResponseInit) {
  const fn = vi.fn().mockResolvedValue(new Response(body, init));
  vi.stubGlobal("fetch", fn);
  return fn;
}

const JSON_HEADERS = { headers: { "content-type": "application/json" } };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  resetClient();
});

describe("schema validation (happy path)", () => {
  it("create_payment", () => {
    expect(
      createPaymentSchema.safeParse({
        amount: 5000,
        mobile_number: "03001234567",
        description: "Test payment",
        txn_ref: "TXN-001",
      }).success
    ).toBe(true);
  });

  it("create_payment without txn_ref (auto-generated)", () => {
    expect(
      createPaymentSchema.safeParse({ amount: 100, mobile_number: "03001234567", description: "x" }).success
    ).toBe(true);
  });

  it("create_mobile_account_payment", () => {
    expect(
      createMobileAccountPaymentSchema.safeParse({
        amount: 10000,
        mobile_number: "03001234567",
        cnic: "123456",
      }).success
    ).toBe(true);
  });

  it("create_voucher", () => {
    expect(
      createVoucherSchema.safeParse({ amount: 2000, mobile_number: "03001234567", cnic: "123456" }).success
    ).toBe(true);
  });

  it("check_payment_status", () => {
    expect(checkPaymentStatusSchema.safeParse({ txn_ref: "TXN-001" }).success).toBe(true);
  });

  it("refund_payment", () => {
    expect(refundPaymentSchema.safeParse({ txn_ref: "TXN-001", amount: 5000 }).success).toBe(true);
  });
});

describe("schema validation (negative path)", () => {
  it("rejects negative amount", () => {
    expect(
      createPaymentSchema.safeParse({ amount: -100, mobile_number: "03001234567", description: "x" }).success
    ).toBe(false);
  });

  it("rejects over-max amount", () => {
    expect(
      createPaymentSchema.safeParse({ amount: 9_999_999, mobile_number: "03001234567", description: "x" }).success
    ).toBe(false);
  });

  it("rejects malformed mobile_number", () => {
    expect(
      createPaymentSchema.safeParse({ amount: 100, mobile_number: "123", description: "x" }).success
    ).toBe(false);
    expect(
      createPaymentSchema.safeParse({ amount: 100, mobile_number: "13001234567", description: "x" }).success
    ).toBe(false);
  });

  it("rejects wrong-length cnic", () => {
    expect(
      createMobileAccountPaymentSchema.safeParse({
        amount: 100,
        mobile_number: "03001234567",
        cnic: "12345678901234",
      }).success
    ).toBe(false);
  });

  it("rejects malformed txn_ref", () => {
    expect(
      createPaymentSchema.safeParse({
        amount: 100,
        mobile_number: "03001234567",
        description: "x",
        txn_ref: "has spaces!",
      }).success
    ).toBe(false);
  });
});

describe("JazzCashClient credentials", () => {
  beforeEach(() => {
    vi.stubEnv("JAZZCASH_MERCHANT_ID", "");
    vi.stubEnv("JAZZCASH_PASSWORD", "");
    vi.stubEnv("JAZZCASH_INTEGRITY_SALT", "");
  });

  it("throws when credentials are missing", () => {
    expect(() => new JazzCashClient()).toThrow("JAZZCASH_MERCHANT_ID");
  });
});

describe("generateHash", () => {
  it("matches the official JazzCash worked test vector (byte-verified)", () => {
    // Official sandbox docs vector: salt 0F5DD14AE2 + sorted values of
    // {pp_Amount:2995, pp_MerchantID:MER123, pp_OrderInfo:A48cvE28}
    // → message "0F5DD14AE2&2995&MER123&A48cvE28" → lowercase HMAC-SHA256 (key=salt).
    withCreds("0F5DD14AE2");
    const client = new JazzCashClient();
    const hash = client.generateHash({
      pp_Amount: "2995",
      pp_MerchantID: "MER123",
      pp_OrderInfo: "A48cvE28",
    });
    expect(hash).toBe("c7689cda7474eb1adcd343fd0c0b676bad0ba66361cc46db589bdb0da4c1c867");
  });

  it("excludes empty/undefined values (the #1 hash-mismatch bug)", () => {
    withCreds();
    const client = new JazzCashClient();
    expect(client.generateHash({ a: "1", b: "", c: "2" })).toBe(client.generateHash({ a: "1", c: "2" }));
    expect(client.generateHash({ a: "1", c: "2" })).toBe(
      client.generateHash({ a: "1", c: "2", pp_SecureHash: "shouldbeignored" })
    );
  });

  it("produces a 64-char lowercase hex digest", () => {
    withCreds();
    const hash = new JazzCashClient().generateHash({ a: "1", b: "2" });
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("verifyResponseHash", () => {
  it("accepts a correctly-signed response and a response with no hash", () => {
    withCreds();
    const client = new JazzCashClient();
    const resp: JazzCashResponse = { pp_ResponseCode: "000", pp_Amount: "10000" };
    const signed: JazzCashResponse = { ...resp, pp_SecureHash: client.generateHash(resp as Record<string, string>) };
    expect(client.verifyResponseHash(signed)).toBe(true);
    expect(client.verifyResponseHash(resp)).toBe(true); // nothing to verify
  });

  it("rejects a tampered response", () => {
    withCreds();
    const client = new JazzCashClient();
    const resp: JazzCashResponse = { pp_ResponseCode: "000", pp_Amount: "10000" };
    const signed: JazzCashResponse = { ...resp, pp_SecureHash: client.generateHash(resp as Record<string, string>) };
    expect(client.verifyResponseHash({ ...signed, pp_Amount: "999999" })).toBe(false);
    expect(client.verifyResponseHash({ ...signed, pp_SecureHash: "deadbeef" })).toBe(false);
  });
});

describe("date formatting", () => {
  it("formats yyyyMMddHHmmss with zero-padding and 1-indexed month", () => {
    withCreds();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-05T03:07:09"));
    expect(new JazzCashClient().getFormattedDateTime()).toBe("20260105030709");
  });

  it("rolls the expiry across day boundaries", () => {
    withCreds();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-05T23:30:00"));
    expect(new JazzCashClient().getExpiryDateTime()).toBe("20260106003000");
  });
});

describe("post / request behaviour", () => {
  it("returns the parsed object on a 200 JSON response and strips secrets", async () => {
    withCreds();
    mockFetch(JSON.stringify({ pp_ResponseCode: "000", pp_ResponseMessage: "Success", pp_Password: "leak" }), {
      status: 200,
      ...JSON_HEADERS,
    });
    const result = await getClient().submit("/Payment/DoMWalletTransaction", { pp_Foo: "bar" });
    expect(result.pp_ResponseCode).toBe("000");
    expect(result.pp_Password).toBeUndefined(); // sanitized
  });

  it("maps a 200 non-JSON response to a code/message object", async () => {
    withCreds();
    mockFetch("OK", { status: 200, headers: { "content-type": "text/plain" } });
    const result = await getClient().submit("/PaymentInquiry/Inquire", { pp_Foo: "bar" });
    expect(result.pp_ResponseMessage).toBe("OK");
  });

  it("throws a sanitized error on a non-2xx response (no body echo)", async () => {
    withCreds();
    mockFetch(JSON.stringify({ pp_Password: "secret" }), { status: 400, ...JSON_HEADERS });
    await expect(getClient().submit("/Payment/DoMWalletTransaction", { pp_Foo: "bar" })).rejects.toThrow(
      /HTTP 400/
    );
    await expect(getClient().submit("/Payment/DoMWalletTransaction", { pp_Foo: "bar" })).rejects.not.toThrow(
      /secret/
    );
  });

  it("maps an AbortError to a timeout message", async () => {
    withCreds();
    const fn = vi.fn().mockRejectedValue(new DOMException("aborted", "AbortError"));
    vi.stubGlobal("fetch", fn);
    await expect(getClient().submit("/Payment/DoMWalletTransaction", { pp_Foo: "bar" })).rejects.toThrow(
      /timeout/
    );
  });

  it("throws when the response hash does not verify", async () => {
    withCreds();
    mockFetch(JSON.stringify({ pp_ResponseCode: "000", pp_SecureHash: "deadbeef" }), {
      status: 200,
      ...JSON_HEADERS,
    });
    await expect(getClient().submit("/Payment/DoMWalletTransaction", { pp_Foo: "bar" })).rejects.toThrow(
      /secure-hash verification/
    );
  });
});

describe("handler integration (create_payment)", () => {
  it("POSTs to the wallet endpoint with paisa amount, MWALLET type, and a secure hash", async () => {
    withCreds();
    const fn = mockFetch(JSON.stringify({ pp_ResponseCode: "000", pp_ResponseMessage: "ok" }), {
      status: 200,
      ...JSON_HEADERS,
    });
    await handleCreatePayment({
      amount: 5000,
      mobile_number: "03001234567",
      description: "Test",
      txn_ref: "TXN-001",
    });

    expect(fn).toHaveBeenCalledTimes(1);
    const [url, options] = fn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://sandbox.jazzcash.com.pk/ApplicationAPI/API/Payment/DoMWalletTransaction");
    const body = JSON.parse(options.body as string);
    expect(body.pp_Amount).toBe("500000"); // 5000 PKR → paisa
    expect(body.pp_TxnType).toBe("MWALLET");
    expect(body.pp_SecureHash).toMatch(/^[0-9a-f]{64}$/);
    expect(body.pp_MobileNumber).toBe("03001234567");
  });
});
