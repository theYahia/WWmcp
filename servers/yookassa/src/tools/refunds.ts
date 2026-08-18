import { z } from "zod";
import { getClient, formatAmount, moneyAmount } from "../client.js";

export const createRefundSchema = z.object({
  payment_id: z.string().describe("ID of the payment to refund"),
  amount: moneyAmount.describe("Refund amount in rubles"),
  description: z.string().optional().describe("Refund reason"),
});

export const getRefundSchema = z.object({
  refund_id: z.string().describe("Refund ID"),
});

export const listRefundsSchema = z.object({
  payment_id: z.string().optional().describe("Filter by payment ID"),
  limit: z.number().int().min(1).max(100).default(10).describe("Count (1-100)"),
});

export async function handleCreateRefund(params: z.infer<typeof createRefundSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    payment_id: params.payment_id,
    amount: formatAmount(params.amount),
  };
  if (params.description) body.description = params.description;

  const result = await getClient().post("/refunds", body);
  return JSON.stringify(result, null, 2);
}

export async function handleGetRefund(params: z.infer<typeof getRefundSchema>): Promise<string> {
  const result = await getClient().get(`/refunds/${params.refund_id}`);
  return JSON.stringify(result, null, 2);
}

export async function handleListRefunds(params: z.infer<typeof listRefundsSchema>): Promise<string> {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit));
  if (params.payment_id) query.set("payment_id", params.payment_id);

  const result = await getClient().get(`/refunds?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}
