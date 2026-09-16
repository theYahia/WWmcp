import { z } from "zod";
import { asaasRequest } from "../client.js";

export const create_subscriptionSchema = z.object({
  customer: z.string().describe("Customer ID"),
  billingType: z.string().describe("Billing type"),
  value: z.number().describe("Amount"),
  cycle: z.string().default("MONTHLY").describe("MONTHLY, WEEKLY, etc."),
});

export async function handleCreateSubscription(params: z.infer<typeof create_subscriptionSchema>): Promise<string> {
  const result = await asaasRequest("POST", "/subscriptions", { body: params });
  return JSON.stringify(result, null, 2);
}
