import { z } from "zod";
import { asaasRequest } from "../client.js";

export const refund_paymentSchema = z.object({
  payment_id: z.string().describe("Payment ID"),
  value: z.number().optional().describe("Amount to refund"),
});

export async function handleRefundPayment(params: z.infer<typeof refund_paymentSchema>): Promise<string> {
  // ponytail: encodeURIComponent — an id like "x?a=" would otherwise turn this into
  // POST /payments/x (Asaas "update payment") with the refund body.
  const result = await asaasRequest("POST", `/payments/${encodeURIComponent(params.payment_id)}/refund`, {
    body: { value: params.value },
  });
  return JSON.stringify(result, null, 2);
}
