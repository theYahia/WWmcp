import { z } from "zod";
import { retailCrmPost } from "../client.js";
import { ok, fail, runTool, type ToolResult } from "../format/index.js";
import { siteField } from "./common.js";

function orderRef(id?: number, externalId?: string): Record<string, string | number> | undefined {
  if (id !== undefined) return { id };
  if (externalId !== undefined) return { externalId };
  return undefined;
}

// ── order_payment_create ─────────────────────────────────────
export const orderPaymentCreateSchema = z.object({
  order_id: z.number().int().optional().describe("Order RetailCRM ID the payment belongs to"),
  order_external_id: z.string().optional().describe("Order externalId (alternative to order_id)"),
  amount: z.number().describe("Payment amount"),
  type: z.string().describe("Payment type code (see list_payment_types)"),
  status: z.string().optional().describe("Payment status code (e.g. 'paid')"),
  paid_at: z.string().optional().describe("Paid timestamp 'YYYY-MM-DD HH:MM:SS'"),
  site: siteField,
});

export async function handleOrderPaymentCreate(params: z.infer<typeof orderPaymentCreateSchema>): Promise<ToolResult> {
  return runTool(async () => {
    if (params.order_id === undefined && params.order_external_id === undefined) {
      return fail("Provide order_id or order_external_id");
    }
    const payment: Record<string, unknown> = {
      order: orderRef(params.order_id, params.order_external_id),
      amount: params.amount,
      type: params.type,
    };
    if (params.status) payment.status = params.status;
    if (params.paid_at) payment.paidAt = params.paid_at;
    const form: Record<string, string> = { payment: JSON.stringify(payment) };
    if (params.site) form.site = params.site;
    const result = await retailCrmPost("/orders/payments/create", form);
    return ok(result);
  });
}

// ── order_payment_edit ───────────────────────────────────────
export const orderPaymentEditSchema = z.object({
  id: z.string().describe("Payment ID (or externalId) to edit"),
  by: z.enum(["id", "externalId"]).default("id").describe("Lookup field"),
  amount: z.number().optional().describe("Updated amount"),
  status: z.string().optional().describe("Updated payment status code"),
  paid_at: z.string().optional().describe("Updated paid timestamp 'YYYY-MM-DD HH:MM:SS'"),
  site: siteField,
});

export async function handleOrderPaymentEdit(params: z.infer<typeof orderPaymentEditSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const payment: Record<string, unknown> = {};
    if (params.amount !== undefined) payment.amount = params.amount;
    if (params.status) payment.status = params.status;
    if (params.paid_at) payment.paidAt = params.paid_at;
    const form: Record<string, string> = { payment: JSON.stringify(payment) };
    if (params.by === "externalId") form.by = "externalId";
    if (params.site) form.site = params.site;
    const result = await retailCrmPost(`/orders/payments/${encodeURIComponent(params.id)}/edit`, form);
    return ok(result);
  });
}

// ── order_payment_delete ─────────────────────────────────────
export const orderPaymentDeleteSchema = z.object({
  id: z.string().describe("Payment ID to delete"),
});

export async function handleOrderPaymentDelete(params: z.infer<typeof orderPaymentDeleteSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const result = await retailCrmPost(`/orders/payments/${encodeURIComponent(params.id)}/delete`, {});
    return ok(result);
  });
}
