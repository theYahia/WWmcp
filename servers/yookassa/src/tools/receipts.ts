import { z } from "zod";
import { getClient, formatAmount, formatKopecks, moneyAmount, toKopecks } from "../client.js";

export const receiptItemSchema = z.object({
  description: z.string().describe("Item/service name"),
  quantity: z.number().positive().describe("Quantity"),
  amount: moneyAmount.describe("Unit price in rubles"),
  vat_code: z.number().int().min(1).max(6).describe(
    "VAT code: 1=no VAT, 2=0%, 3=10%, 4=20%, 5=computed 10/110, 6=computed 20/120"
  ),
  payment_subject: z.string().optional().describe(
    "Payment subject, tag 1212 (default 'commodity'; 'service' for services)"
  ),
  payment_mode: z.string().optional().describe(
    "Payment mode, tag 1214 (default 'full_payment')"
  ),
  measure: z.string().optional().describe(
    "Measure, tag 2108 (default 'piece'; required for FFD 1.2 and Receipts-from-YooMoney)"
  ),
});

export const createReceiptSchema = z.object({
  type: z.enum(["payment", "refund"]).describe("Receipt type"),
  payment_id: z.string().optional().describe("Payment ID (required for type=payment)"),
  refund_id: z.string().optional().describe("Refund ID (required for type=refund)"),
  customer_email: z.string().email().optional().describe("Customer email for the receipt"),
  customer_phone: z.string().optional().describe("Customer phone (if no email)"),
  tax_system_code: z.number().int().min(1).max(6).optional().describe(
    "Tax system code, tag 1055 (1-6). Send only if the shop has multiple tax systems or uses FFD 1.2"
  ),
  items: z.array(receiptItemSchema).min(1).describe("Receipt items/services"),
  settlements: z.array(z.object({
    type: z.string().describe("Settlement type: cashless, prepayment, postpayment, consideration"),
    amount: moneyAmount.describe("Settlement amount"),
  })).optional().describe("Settlements. If omitted — auto: one 'cashless' for the sum of items"),
  send: z.boolean().default(true).describe("Send the receipt to the customer (required for a standalone receipt)"),
  settlement_id: z.string().optional().describe("Settlement ID (for linking)"),
});

/** Build the receipt `items` array with 54-FZ fiscal attributes (defaults applied). */
export function buildReceiptItems(items: z.infer<typeof receiptItemSchema>[], currency = "RUB") {
  return items.map(item => ({
    description: item.description,
    quantity: String(item.quantity),
    amount: formatAmount(item.amount, currency),
    vat_code: item.vat_code,
    payment_subject: item.payment_subject ?? "commodity",
    payment_mode: item.payment_mode ?? "full_payment",
    measure: item.measure ?? "piece",
  }));
}

export const listReceiptsSchema = z.object({
  payment_id: z.string().optional().describe("Filter by payment ID"),
  refund_id: z.string().optional().describe("Filter by refund ID"),
  limit: z.number().int().min(1).max(100).default(10).describe("Count (1-100)"),
  cursor: z.string().optional().describe("Pagination cursor"),
});

export async function handleCreateReceipt(params: z.infer<typeof createReceiptSchema>): Promise<string> {
  const customer: Record<string, string> = {};
  if (params.customer_email) customer.email = params.customer_email;
  if (params.customer_phone) customer.phone = params.customer_phone;

  // Standalone POST /receipts requires `settlements` and `send`. If settlements are not
  // supplied, build a single cashless settlement summing the item line totals.
  // Auto settlement = sum of line totals. Unit price is exact integer kopecks; for a
  // fractional quantity the per-line product is rounded to the nearest kopeck (settlements
  // are informational metadata on the receipt, not the charged transaction amount).
  const settlements = params.settlements
    ? params.settlements.map(s => ({ type: s.type, amount: formatAmount(s.amount) }))
    : [{
        type: "cashless",
        amount: formatKopecks(
          params.items.reduce((sum, it) => sum + Math.round(toKopecks(it.amount) * it.quantity), 0),
        ),
      }];

  const body: Record<string, unknown> = {
    type: params.type,
    customer,
    send: params.send,
    items: buildReceiptItems(params.items),
    settlements,
  };

  if (params.tax_system_code !== undefined) body.tax_system_code = params.tax_system_code;
  if (params.payment_id) body.payment_id = params.payment_id;
  if (params.refund_id) body.refund_id = params.refund_id;
  if (params.settlement_id) body.settlement_id = params.settlement_id;

  const result = await getClient().post("/receipts", body);
  return JSON.stringify(result, null, 2);
}

export async function handleListReceipts(params: z.infer<typeof listReceiptsSchema>): Promise<string> {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit));
  if (params.payment_id) query.set("payment_id", params.payment_id);
  if (params.refund_id) query.set("refund_id", params.refund_id);
  if (params.cursor) query.set("cursor", params.cursor);

  const result = await getClient().get(`/receipts?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}
