import { z } from "zod";
import { asaasRequest } from "../client.js";

export const create_paymentSchema = z.object({
  customer: z.string().describe("Customer ID"),
  billingType: z.string().describe("BOLETO, CREDIT_CARD, PIX"),
  value: z.number().describe("Amount"),
  dueDate: z.string().describe("Due date YYYY-MM-DD"),
});

export async function handleCreatePayment(params: z.infer<typeof create_paymentSchema>): Promise<string> {
  const result = await asaasRequest("POST", "/payments", { body: params });
  return JSON.stringify(result, null, 2);
}
