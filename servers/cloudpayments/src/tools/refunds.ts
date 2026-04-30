import { z } from "zod";
import { cpPost } from "../client.js";

export const refundSchema = z.object({
  TransactionId: z.number().int().positive().describe("Transaction ID to refund"),
  Amount: z.number().positive().describe("Refund amount (full or partial)"),
  JsonData: z.string().optional().describe("Additional data (JSON string)"),
});

export async function handleRefund(params: z.infer<typeof refundSchema>): Promise<string> {
  const body: Record<string, unknown> = { ...params };
  const result = await cpPost("/payments/refund", body);
  return JSON.stringify(result, null, 2);
}
