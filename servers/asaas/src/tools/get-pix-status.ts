import { z } from "zod";
import { asaasRequest } from "../client.js";

export const get_pix_statusSchema = z.object({
  payment_id: z.string().describe("Payment ID"),
});

export async function handleGetPixStatus(params: z.infer<typeof get_pix_statusSchema>): Promise<string> {
  const result = await asaasRequest("GET", `/payments/${encodeURIComponent(params.payment_id)}/status`);
  return JSON.stringify(result, null, 2);
}
