import { z } from "zod";
import { TKassaClient, toKopecks } from "../client.js";

let _client: TKassaClient | null = null;
function getClient(): TKassaClient {
  if (!_client) _client = new TKassaClient();
  return _client;
}

// --- Schema ---

export const cancelPaymentSchema = z.object({
  payment_id: z.string().describe("Payment ID to refund in T-Kassa system"),
  amount: z.number().positive().optional().describe("Refund amount in rubles (for partial refund). If omitted, full refund."),
});

// --- Handler ---

export async function handleCancelPayment(params: z.infer<typeof cancelPaymentSchema>): Promise<string> {
  const body: Record<string, unknown> = { PaymentId: params.payment_id };
  if (params.amount) body.Amount = toKopecks(params.amount);

  const result = await getClient().post("/Cancel", body);
  return JSON.stringify(result, null, 2);
}
