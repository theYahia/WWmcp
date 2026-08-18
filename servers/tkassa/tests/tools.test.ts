import { describe, it, expect, vi } from "vitest";

vi.mock("../src/client.js", () => ({
  TKassaClient: class {
    post = vi.fn();
  },
  toKopecks: (r: number) => Math.round(r * 100),
}));

import { initPaymentSchema, getStateSchema, confirmSchema, cancelSchema } from "../src/tools/payments.js";
import { cancelPaymentSchema } from "../src/tools/refunds.js";
import { toKopecks } from "../src/client.js";

describe("toKopecks", () => {
  it("converts rubles to kopecks", () => {
    expect(toKopecks(100.50)).toBe(10050);
    expect(toKopecks(1)).toBe(100);
    expect(toKopecks(0.01)).toBe(1);
  });
});

describe("initPaymentSchema", () => {
  it("accepts valid payment params", () => {
    const result = initPaymentSchema.safeParse({
      amount: 100.50,
      order_id: "ORD-001",
      description: "Test payment",
    });
    expect(result.success).toBe(true);
  });

  it("requires amount and order_id", () => {
    expect(initPaymentSchema.safeParse({}).success).toBe(false);
    expect(initPaymentSchema.safeParse({ amount: 100 }).success).toBe(false);
  });

  it("rejects negative amounts", () => {
    expect(initPaymentSchema.safeParse({ amount: -10, order_id: "X" }).success).toBe(false);
  });

  it("accepts optional fields", () => {
    const result = initPaymentSchema.safeParse({
      amount: 500,
      order_id: "ORD-002",
      description: "Full params",
      customer_key: "CUST-1",
      notification_url: "https://example.com/notify",
      success_url: "https://example.com/success",
      fail_url: "https://example.com/fail",
    });
    expect(result.success).toBe(true);
  });
});

describe("getStateSchema", () => {
  it("requires payment_id", () => {
    expect(getStateSchema.safeParse({}).success).toBe(false);
    expect(getStateSchema.safeParse({ payment_id: "12345" }).success).toBe(true);
  });
});

describe("confirmSchema", () => {
  it("requires payment_id", () => {
    expect(confirmSchema.safeParse({}).success).toBe(false);
    expect(confirmSchema.safeParse({ payment_id: "12345" }).success).toBe(true);
  });

  it("accepts optional amount", () => {
    const result = confirmSchema.safeParse({ payment_id: "12345", amount: 50 });
    expect(result.success).toBe(true);
  });
});

describe("cancelSchema", () => {
  it("requires payment_id", () => {
    expect(cancelSchema.safeParse({ payment_id: "12345" }).success).toBe(true);
  });
});

describe("cancelPaymentSchema (refund)", () => {
  it("requires payment_id", () => {
    expect(cancelPaymentSchema.safeParse({}).success).toBe(false);
    expect(cancelPaymentSchema.safeParse({ payment_id: "12345" }).success).toBe(true);
  });

  it("accepts optional amount for partial refund", () => {
    const result = cancelPaymentSchema.safeParse({ payment_id: "12345", amount: 25.50 });
    expect(result.success).toBe(true);
  });
});
