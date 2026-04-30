import { z } from "zod";
import { mpGet, mpPost } from "../client.js";

// ── create_payment ──

export const createPaymentSchema = z.object({
  transaction_amount: z.number().positive().describe("Amount to charge (in account currency, e.g. ARS, BRL, MXN)"),
  description: z.string().describe("Payment description"),
  payment_method_id: z.string().describe("Payment method ID (e.g. 'visa', 'master', 'pix', 'rapipago')"),
  payer_email: z.string().email().describe("Payer email address"),
  token: z.string().optional().describe("Card token from frontend SDK (required for card payments)"),
  installments: z.number().int().min(1).optional().describe("Number of installments (cards only)"),
  external_reference: z.string().optional().describe("Your internal order/reference ID"),
  notification_url: z.string().url().optional().describe("Webhook URL for status updates"),
  metadata: z.record(z.unknown()).optional().describe("Custom key-value metadata"),
});

export async function handleCreatePayment(
  params: z.infer<typeof createPaymentSchema>,
): Promise<string> {
  const body: Record<string, unknown> = {
    transaction_amount: params.transaction_amount,
    description: params.description,
    payment_method_id: params.payment_method_id,
    payer: { email: params.payer_email },
  };
  if (params.token) body.token = params.token;
  if (params.installments) body.installments = params.installments;
  if (params.external_reference) body.external_reference = params.external_reference;
  if (params.notification_url) body.notification_url = params.notification_url;
  if (params.metadata) body.metadata = params.metadata;

  const result = await mpPost("/v1/payments", body);
  return JSON.stringify(result, null, 2);
}

// ── get_payment ──

export const getPaymentSchema = z.object({
  payment_id: z.string().describe("MercadoPago payment ID"),
});

export async function handleGetPayment(
  params: z.infer<typeof getPaymentSchema>,
): Promise<string> {
  const result = await mpGet(`/v1/payments/${params.payment_id}`);
  return JSON.stringify(result, null, 2);
}

// ── search_payments ──

export const searchPaymentsSchema = z.object({
  external_reference: z.string().optional().describe("Filter by your internal reference"),
  status: z
    .enum(["pending", "approved", "authorized", "in_process", "in_mediation", "rejected", "cancelled", "refunded", "charged_back"])
    .optional()
    .describe("Filter by payment status"),
  range: z.enum(["date_created", "date_last_updated", "date_approved", "money_release_date"]).default("date_created").describe("Date range field"),
  begin_date: z.string().optional().describe("ISO 8601 start date (e.g. 2026-01-01T00:00:00Z)"),
  end_date: z.string().optional().describe("ISO 8601 end date"),
  limit: z.number().int().min(1).max(100).default(30).describe("Results per page"),
  offset: z.number().int().min(0).default(0).describe("Pagination offset"),
});

export async function handleSearchPayments(
  params: z.infer<typeof searchPaymentsSchema>,
): Promise<string> {
  const query: Record<string, string> = {
    limit: String(params.limit),
    offset: String(params.offset),
    range: params.range,
  };
  if (params.external_reference) query.external_reference = params.external_reference;
  if (params.status) query.status = params.status;
  if (params.begin_date) query.begin_date = params.begin_date;
  if (params.end_date) query.end_date = params.end_date;

  const result = await mpGet("/v1/payments/search", query);
  return JSON.stringify(result, null, 2);
}

// ── refund_payment ──

export const refundPaymentSchema = z.object({
  payment_id: z.string().describe("Payment ID to refund"),
  amount: z.number().positive().optional().describe("Partial refund amount (omit for full refund)"),
});

export async function handleRefundPayment(
  params: z.infer<typeof refundPaymentSchema>,
): Promise<string> {
  const body: Record<string, unknown> = {};
  if (params.amount !== undefined) body.amount = params.amount;
  const result = await mpPost(`/v1/payments/${params.payment_id}/refunds`, body);
  return JSON.stringify(result, null, 2);
}

// ── get_payment_methods ──

export const getPaymentMethodsSchema = z.object({});

export async function handleGetPaymentMethods(
  _params: z.infer<typeof getPaymentMethodsSchema>,
): Promise<string> {
  const result = await mpGet("/v1/payment_methods");
  return JSON.stringify(result, null, 2);
}
