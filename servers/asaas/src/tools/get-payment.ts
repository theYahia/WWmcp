import { z } from "zod";
import { asaasRequest } from "../client.js";

export const get_paymentSchema = z.object({
  payment_id: z.string().describe("Payment ID"),
});

export async function handleGetPayment(params: z.infer<typeof get_paymentSchema>): Promise<string> {
  const result = await asaasRequest("GET", `/payments/${encodeURIComponent(params.payment_id)}`);
  return JSON.stringify(result, null, 2);
}
