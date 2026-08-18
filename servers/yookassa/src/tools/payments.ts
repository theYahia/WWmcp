import { z } from "zod";
import { getClient, formatAmount, formatKopecks, moneyAmount, currencyCode, toKopecks } from "../client.js";
import { buildReceiptItems } from "./receipts.js";

// --- Schemas ---

export const createPaymentSchema = z.object({
  amount: moneyAmount.describe("Payment amount in rubles (string '5000.00' for exactness, or a number)"),
  currency: currencyCode.describe("Currency (ISO-4217, default RUB)"),
  description: z.string().max(128).describe("Payment description (max 128 chars)"),
  capture: z.boolean().default(true).describe("true = one-step (auto-capture), false = two-step (hold)"),
  confirmation_type: z.enum(["redirect", "embedded", "qr"]).default("redirect").describe("Confirmation type: redirect (needs return_url), embedded (widget), or qr"),
  return_url: z.string().url().optional().describe("URL to return the payer to after payment — REQUIRED when confirmation_type=redirect"),
  payment_method_type: z.enum([
    "bank_card", "sbp", "yoo_money", "sberbank", "tinkoff_bank",
    "mobile_balance", "cash", "installments"
  ]).optional().describe("Payment method"),
  metadata: z.record(z.string()).optional().describe("Arbitrary metadata (key-value)"),
  receipt_email: z.string().email().optional().describe("Customer email for the receipt"),
  receipt_tax_system_code: z.number().int().min(1).max(6).optional().describe("Receipt tax system code, tag 1055 (only if the shop has multiple tax systems / FFD 1.2)"),
  receipt_items: z.array(z.object({
    description: z.string().describe("Item/service name"),
    quantity: z.number().positive().describe("Quantity"),
    amount: moneyAmount.describe("Unit price"),
    vat_code: z.number().int().min(1).max(6).describe("VAT code: 1=no VAT, 2=0%, 3=10%, 4=20%, 5=10/110, 6=20/120"),
    payment_subject: z.string().optional().describe("Payment subject, tag 1212 (default 'commodity')"),
    payment_mode: z.string().optional().describe("Payment mode, tag 1214 (default 'full_payment')"),
    measure: z.string().optional().describe("Measure, tag 2108 (default 'piece'; required for FFD 1.2)"),
  })).optional().describe("Items for a 54-FZ receipt (if issuing a receipt with the payment)"),
});

export const getPaymentSchema = z.object({
  payment_id: z.string().describe("Payment ID (e.g. pay_xxx)"),
});

export const capturePaymentSchema = z.object({
  payment_id: z.string().describe("ID of the payment to capture"),
  amount: moneyAmount.optional().describe("Amount for a partial capture (optional; must be <= the authorized amount, same currency). Over-capture is rejected by YooKassa"),
});

export const cancelPaymentSchema = z.object({
  payment_id: z.string().describe("ID of the payment to cancel"),
});

export const listPaymentsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(10).describe("Count (1-100, default 10)"),
  status: z.enum(["pending", "waiting_for_capture", "succeeded", "canceled"]).optional().describe("Filter by status"),
  created_at_gte: z.string().optional().describe("From date (ISO-8601 datetime)"),
  created_at_lte: z.string().optional().describe("To date (ISO-8601 datetime)"),
  cursor: z.string().optional().describe("Pagination cursor (from next_cursor of the previous response)"),
});

export const savePaymentMethodSchema = z.object({
  amount: moneyAmount.describe("Binding amount (min 1 ruble; charged then refundable)"),
  currency: currencyCode.describe("Currency (ISO-4217, default RUB)"),
  description: z.string().default("Card binding").describe("Description"),
  return_url: z.string().url().describe("URL to return to after binding"),
  payment_method_type: z.enum(["bank_card", "yoo_money", "sberbank"]).default("bank_card").describe("Payment method type"),
});

export const createRecurringPaymentSchema = z.object({
  payment_method_id: z.string().describe("ID of the saved payment method (from payment_method.id)"),
  amount: moneyAmount.describe("Recurring charge amount"),
  currency: currencyCode.describe("Currency (ISO-4217, default RUB)"),
  description: z.string().max(128).describe("Recurring payment description"),
});

export const createSbpPaymentSchema = z.object({
  amount: moneyAmount.describe("SBP payment amount"),
  currency: currencyCode.describe("Currency (ISO-4217, default RUB)"),
  description: z.string().max(128).describe("Payment description"),
  confirmation_type: z.enum(["redirect", "embedded", "qr"]).default("redirect").describe("Confirmation type: redirect (needs return_url), embedded, or qr"),
  return_url: z.string().url().optional().describe("Return URL — REQUIRED when confirmation_type=redirect"),
});

export const createSplitPaymentSchema = z.object({
  amount: moneyAmount.describe("Total payment amount"),
  currency: currencyCode.describe("Currency (ISO-4217, default RUB)"),
  description: z.string().max(128).describe("Payment description"),
  confirmation_type: z.enum(["redirect", "embedded", "qr"]).default("redirect").describe("Confirmation type: redirect (needs return_url), embedded, or qr"),
  return_url: z.string().url().optional().describe("Return URL — REQUIRED when confirmation_type=redirect"),
  transfers: z.array(z.object({
    account_id: z.string().describe("Recipient ID (partner shopId connected to the platform)"),
    amount: moneyAmount.describe("Amount for this recipient"),
    platform_fee_amount: moneyAmount.optional().describe("Platform commission withheld from this transfer (API field platform_fee_amount)"),
    description: z.string().optional().describe("Transfer description"),
    metadata: z.record(z.string()).optional().describe("Transfer metadata"),
  })).min(1).describe("Recipients (splits). The sum of transfers must equal amount. Requires the Split Payments product"),
});

// --- Handlers ---

/**
 * Build a confirmation object. For redirect, return_url is required (no placeholder is
 * invented — a bogus return_url would redirect the real payer to a dead page after paying).
 * embedded/qr need no return_url.
 */
function buildConfirmation(type: "redirect" | "embedded" | "qr", returnUrl?: string): Record<string, unknown> {
  // embedded/qr need no return_url; everything else (incl. the default) is redirect.
  if (type === "embedded" || type === "qr") {
    return { type };
  }
  if (!returnUrl) {
    throw new Error(
      "return_url is required when confirmation_type=redirect (the URL YooKassa returns the payer to after payment). " +
      "Pass a real return_url or choose confirmation_type=embedded/qr."
    );
  }
  return { type: "redirect", return_url: returnUrl };
}

export async function handleCreatePayment(params: z.infer<typeof createPaymentSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    amount: formatAmount(params.amount, params.currency),
    description: params.description,
    capture: params.capture,
    confirmation: buildConfirmation(params.confirmation_type, params.return_url),
  };

  if (params.payment_method_type) {
    body.payment_method_data = { type: params.payment_method_type };
  }

  if (params.metadata) {
    body.metadata = params.metadata;
  }

  if (params.receipt_email && params.receipt_items) {
    const receipt: Record<string, unknown> = {
      customer: { email: params.receipt_email },
      items: buildReceiptItems(params.receipt_items, params.currency),
    };
    if (params.receipt_tax_system_code !== undefined) receipt.tax_system_code = params.receipt_tax_system_code;
    body.receipt = receipt;
  }

  const result = await getClient().post("/payments", body);
  return JSON.stringify(result, null, 2);
}

export async function handleGetPayment(params: z.infer<typeof getPaymentSchema>): Promise<string> {
  const result = await getClient().get(`/payments/${params.payment_id}`);
  return JSON.stringify(result, null, 2);
}

export async function handleCapturePayment(params: z.infer<typeof capturePaymentSchema>): Promise<string> {
  const body = params.amount ? { amount: formatAmount(params.amount) } : {};
  const result = await getClient().post(`/payments/${params.payment_id}/capture`, body);
  return JSON.stringify(result, null, 2);
}

export async function handleCancelPayment(params: z.infer<typeof cancelPaymentSchema>): Promise<string> {
  const result = await getClient().post(`/payments/${params.payment_id}/cancel`, {});
  return JSON.stringify(result, null, 2);
}

export async function handleListPayments(params: z.infer<typeof listPaymentsSchema>): Promise<string> {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit));
  if (params.status) query.set("status", params.status);
  if (params.created_at_gte) query.set("created_at.gte", params.created_at_gte);
  if (params.created_at_lte) query.set("created_at.lte", params.created_at_lte);
  if (params.cursor) query.set("cursor", params.cursor);

  const result = await getClient().get(`/payments?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}

export async function handleSavePaymentMethod(params: z.infer<typeof savePaymentMethodSchema>): Promise<string> {
  const body = {
    amount: formatAmount(params.amount, params.currency),
    description: params.description,
    capture: true,
    payment_method_data: { type: params.payment_method_type },
    save_payment_method: true,
    confirmation: { type: "redirect", return_url: params.return_url },
  };

  const result = await getClient().post("/payments", body);
  return JSON.stringify(result, null, 2);
}

export async function handleCreateRecurringPayment(params: z.infer<typeof createRecurringPaymentSchema>): Promise<string> {
  const body = {
    amount: formatAmount(params.amount, params.currency),
    description: params.description,
    capture: true,
    payment_method_id: params.payment_method_id,
  };

  const result = await getClient().post("/payments", body);
  return JSON.stringify(result, null, 2);
}

export async function handleCreateSbpPayment(params: z.infer<typeof createSbpPaymentSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    amount: formatAmount(params.amount, params.currency),
    description: params.description,
    capture: true,
    payment_method_data: { type: "sbp" },
    confirmation: buildConfirmation(params.confirmation_type, params.return_url),
  };

  const result = await getClient().post("/payments", body);
  return JSON.stringify(result, null, 2);
}

export async function handleCreateSplitPayment(params: z.infer<typeof createSplitPaymentSchema>): Promise<string> {
  // The buyer is charged `amount`, distributed across transfers — their sum must equal it.
  const totalK = toKopecks(params.amount);
  const sumK = params.transfers.reduce((s, t) => s + toKopecks(t.amount), 0);
  if (sumK !== totalK) {
    throw new Error(
      `The sum of transfers (${formatKopecks(sumK, params.currency).value}) must equal the total payment amount (${formatKopecks(totalK, params.currency).value}).`
    );
  }

  const body: Record<string, unknown> = {
    amount: formatAmount(params.amount, params.currency),
    description: params.description,
    capture: true,
    confirmation: buildConfirmation(params.confirmation_type, params.return_url),
    transfers: params.transfers.map(t => ({
      account_id: t.account_id,
      amount: formatAmount(t.amount, params.currency),
      ...(t.platform_fee_amount !== undefined ? { platform_fee_amount: formatAmount(t.platform_fee_amount, params.currency) } : {}),
      ...(t.description ? { description: t.description } : {}),
      ...(t.metadata ? { metadata: t.metadata } : {}),
    })),
  };

  const result = await getClient().post("/payments", body);
  return JSON.stringify(result, null, 2);
}
