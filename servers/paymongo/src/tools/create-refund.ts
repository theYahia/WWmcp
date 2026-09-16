import { z } from "zod";
import { getClient } from "../client.js";
import type { ToolDescriptor } from "../lib/tool.js";

export const createRefundSchema = z.object({
  payment_id: z.string().describe("Payment ID to refund (pay_...)."),
  amount: z
    .number()
    .int()
    .positive()
    .describe("Refund amount in centavos as an integer."),
  reason: z
    .enum(["duplicate", "fraudulent", "requested_by_customer", "others"])
    .describe("Refund reason."),
});

export async function handleCreateRefund(
  params: z.infer<typeof createRefundSchema>,
): Promise<string> {
  const body = {
    data: {
      attributes: {
        payment_id: params.payment_id,
        amount: params.amount,
        reason: params.reason,
      },
    },
  };
  const result = await getClient().request("POST", "/refunds", body, {
    moneyMoving: true,
  });
  return JSON.stringify(result, null, 2);
}

export const createRefundTool: ToolDescriptor = {
  name: "create_refund",
  title: "Create Refund",
  description: "Refund a payment, fully or partially (moves money back to the customer).",
  inputSchema: createRefundSchema.shape,
  annotations: { destructiveHint: true, openWorldHint: true },
  handler: handleCreateRefund,
};
