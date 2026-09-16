import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendSmsSchema } from "../tools/send-sms.js";
import { sendBulkSmsSchema } from "../tools/send-bulk-sms.js";
import { getDeliveryStatusSchema } from "../tools/get-delivery-status.js";
import { getAccountInfoSchema } from "../tools/get-account-info.js";
import { lookupSchema } from "../tools/lookup.js";
import { sendOtpSchema } from "../tools/send-otp.js";
import { getBalanceSchema } from "../tools/get-balance.js";
import { listOutboxSchema } from "../tools/list-outbox.js";

describe("kavenegar-mcp schemas", () => {
  it("validates send_sms params", () => {
    const valid = sendSmsSchema.safeParse({
      receptor: "09121234567",
      message: "Hello from Kavenegar",
    });
    expect(valid.success).toBe(true);
  });

  it("validates send_sms with optional sender", () => {
    const valid = sendSmsSchema.safeParse({
      receptor: "09121234567",
      message: "Test",
      sender: "10004346",
    });
    expect(valid.success).toBe(true);
  });

  it("validates send_bulk_sms params", () => {
    const valid = sendBulkSmsSchema.safeParse({
      receptors: ["09121234567", "09129876543"],
      message: "Bulk message",
    });
    expect(valid.success).toBe(true);
  });

  it("rejects send_bulk_sms with empty receptors", () => {
    const invalid = sendBulkSmsSchema.safeParse({
      receptors: [],
      message: "Test",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates get_delivery_status params", () => {
    const valid = getDeliveryStatusSchema.safeParse({ messageid: "123456789" });
    expect(valid.success).toBe(true);
  });

  it("validates get_account_info params (empty)", () => {
    const valid = getAccountInfoSchema.safeParse({});
    expect(valid.success).toBe(true);
  });

  it("validates lookup params", () => {
    const valid = lookupSchema.safeParse({
      receptor: "09121234567",
      template: "verify",
      tokens: ["123456"],
    });
    expect(valid.success).toBe(true);
  });

  it("validates lookup with multiple tokens", () => {
    const valid = lookupSchema.safeParse({
      receptor: "09121234567",
      template: "order-status",
      tokens: ["ORD-001", "delivered", "2026-04-01"],
    });
    expect(valid.success).toBe(true);
  });

  it("rejects lookup with more than 3 tokens", () => {
    const invalid = lookupSchema.safeParse({
      receptor: "09121234567",
      template: "test",
      tokens: ["a", "b", "c", "d"],
    });
    expect(invalid.success).toBe(false);
  });

  it("validates send_otp params", () => {
    const valid = sendOtpSchema.safeParse({
      receptor: "09121234567",
      template: "otp-verify",
    });
    expect(valid.success).toBe(true);
  });

  it("validates get_balance params (empty)", () => {
    const valid = getBalanceSchema.safeParse({});
    expect(valid.success).toBe(true);
  });

  it("validates list_outbox params", () => {
    const valid = listOutboxSchema.safeParse({
      date_from: "1711929600",
      date_to: "1712016000",
    });
    expect(valid.success).toBe(true);
  });
});

describe("KavenegarClient", () => {
  beforeEach(() => {
    vi.stubEnv("KAVENEGAR_API_KEY", "");
  });

  it("throws when credentials are missing", async () => {
    const { KavenegarClient } = await import("../client.js");
    expect(() => new KavenegarClient()).toThrow("KAVENEGAR_API_KEY");
  });
});
