import { z } from "zod";
import { asaasRequest } from "../client.js";

export const create_pix_qrSchema = z.object({
  payment_id: z.string().describe("Payment ID"),
});

export async function handleCreatePixQr(params: z.infer<typeof create_pix_qrSchema>): Promise<string> {
  const result = await asaasRequest("GET", `/payments/${encodeURIComponent(params.payment_id)}/pixQrCode`);
  return JSON.stringify(result, null, 2);
}
