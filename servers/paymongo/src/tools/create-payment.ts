import { z } from "zod";
import { getClient } from "../client.js";
import type { ToolDescriptor } from "../lib/tool.js";

export const createPaymentSchema = z.object({
  amount: z
    .number()
    .int()
    .positive()
    .describe("Amount in centavos as an integer (e.g. 5000 = ₱50.00)."),
  currency: z.string().default("PHP").describe("ISO currency code."),
  source_id: z.string().describe("Source ID to charge (src_...)."),
  description: z.string().optional().describe("Payment description"),
});

export async function handleCreatePayment(
  params: z.infer<typeof createPaymentSchema>,
): Promise<string> {
  const body = {
    data: {
      attributes: {
        amount: params.amount,
        currency: params.currency,
        source: { id: params.source_id, type: "source" },
        description: params.description || "",
      },
    },
  };
  const result = await getClient().request("POST", "/payments", body, {
    moneyMoving: true,
  });
  return JSON.stringify(result, null, 2);
}

export const createPaymentTool: ToolDescriptor = {
  name: "create_payment",
  title: "Create Payment",
  description: "Charge a chargeable source to create a payment (moves money).",
  inputSchema: createPaymentSchema.shape,
  annotations: { destructiveHint: true, openWorldHint: true },
  handler: handleCreatePayment,
};
