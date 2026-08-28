import { describe, it, expect } from "vitest";
import {
  createPaymentSchema,
  getPaymentSchema,
  capturePaymentSchema,
  cancelPaymentSchema,
  listPaymentsSchema,
} from "../src/tools/payments.js";
import {
  createRefundSchema,
  getRefundSchema,
  listRefundsSchema,
} from "../src/tools/refunds.js";
import { createReceiptSchema } from "../src/tools/receipts.js";

describe("Payment schemas", () => {
  it("createPaymentSchema accepts valid input", () => {
    const result = createPaymentSchema.safeParse({
      amount: 5000,
      description: "Заказ #123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("RUB");
      expect(result.data.capture).toBe(true);
    }
  });

  it("createPaymentSchema rejects negative amount", () => {
    const result = createPaymentSchema.safeParse({
      amount: -100,
      description: "test",
    });
    expect(result.success).toBe(false);
  });

  it("createPaymentSchema rejects missing description", () => {
    const result = createPaymentSchema.safeParse({ amount: 100 });
    expect(result.success).toBe(false);
  });

  it("createPaymentSchema rejects description > 128 chars", () => {
    const result = createPaymentSchema.safeParse({
      amount: 100,
      description: "x".repeat(129),
    });
    expect(result.success).toBe(false);
  });

  it("createPaymentSchema accepts optional payment_method_type", () => {
    const result = createPaymentSchema.safeParse({
      amount: 1000,
      description: "SBP payment",
      payment_method_type: "sbp",
    });
    expect(result.success).toBe(true);
  });

  it("createPaymentSchema rejects invalid payment_method_type", () => {
    const result = createPaymentSchema.safeParse({
      amount: 1000,
      description: "test",
      payment_method_type: "bitcoin",
    });
    expect(result.success).toBe(false);
  });

  it("createPaymentSchema validates currency as ISO-4217 (rejects typos)", () => {
    expect(createPaymentSchema.safeParse({ amount: 100, description: "x", currency: "USD" }).success).toBe(true);
    expect(createPaymentSchema.safeParse({ amount: 100, description: "x", currency: "rub" }).success).toBe(false);
    expect(createPaymentSchema.safeParse({ amount: 100, description: "x", currency: "руб" }).success).toBe(false);
    const dflt = createPaymentSchema.safeParse({ amount: 100, description: "x" });
    expect(dflt.success && dflt.data.currency).toBe("RUB");
  });

  it("getPaymentSchema validates payment_id", () => {
    expect(getPaymentSchema.safeParse({ payment_id: "pay_123" }).success).toBe(true);
    expect(getPaymentSchema.safeParse({}).success).toBe(false);
  });

  it("capturePaymentSchema accepts with and without amount", () => {
    expect(capturePaymentSchema.safeParse({ payment_id: "pay_123" }).success).toBe(true);
    expect(capturePaymentSchema.safeParse({ payment_id: "pay_123", amount: 2500 }).success).toBe(true);
    expect(capturePaymentSchema.safeParse({ payment_id: "pay_123", amount: -1 }).success).toBe(false);
  });

  it("cancelPaymentSchema validates", () => {
    expect(cancelPaymentSchema.safeParse({ payment_id: "pay_123" }).success).toBe(true);
    expect(cancelPaymentSchema.safeParse({}).success).toBe(false);
  });

  it("listPaymentsSchema defaults and constraints", () => {
    const result = listPaymentsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.limit).toBe(10);

    expect(listPaymentsSchema.safeParse({ limit: 0 }).success).toBe(false);
    expect(listPaymentsSchema.safeParse({ limit: 101 }).success).toBe(false);
    expect(listPaymentsSchema.safeParse({ status: "succeeded" }).success).toBe(true);
    expect(listPaymentsSchema.safeParse({ status: "invalid" }).success).toBe(false);
  });
});

describe("Refund schemas", () => {
  it("createRefundSchema valid", () => {
    const result = createRefundSchema.safeParse({
      payment_id: "pay_123",
      amount: 2500,
    });
    expect(result.success).toBe(true);
  });

  it("createRefundSchema rejects missing fields", () => {
    expect(createRefundSchema.safeParse({ amount: 100 }).success).toBe(false);
    expect(createRefundSchema.safeParse({ payment_id: "pay_123" }).success).toBe(false);
  });

  it("getRefundSchema validates", () => {
    expect(getRefundSchema.safeParse({ refund_id: "ref_123" }).success).toBe(true);
    expect(getRefundSchema.safeParse({}).success).toBe(false);
  });

  it("listRefundsSchema defaults", () => {
    const result = listRefundsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.limit).toBe(10);
  });
});

describe("Receipt schema", () => {
  const validReceipt = {
    type: "payment" as const,
    payment_id: "pay_123",
    customer_email: "test@example.com",
    items: [
      { description: "Консультация", quantity: 1, amount: 5000, vat_code: 4 },
    ],
  };

  it("accepts valid receipt", () => {
    expect(createReceiptSchema.safeParse(validReceipt).success).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(createReceiptSchema.safeParse({ ...validReceipt, customer_email: "not-email" }).success).toBe(false);
  });

  it("rejects empty items", () => {
    expect(createReceiptSchema.safeParse({ ...validReceipt, items: [] }).success).toBe(false);
  });

  it("rejects invalid vat_code", () => {
    const bad = { ...validReceipt, items: [{ ...validReceipt.items[0], vat_code: 7 }] };
    expect(createReceiptSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects invalid type", () => {
    expect(createReceiptSchema.safeParse({ ...validReceipt, type: "invoice" }).success).toBe(false);
  });
});
