import { z } from "zod";
import { getClient } from "../client.js";
import type { ToolDescriptor } from "../lib/tool.js";

export const getPaymentIntentSchema = z.object({
  payment_intent_id: z.string().describe("Payment intent ID (pi_...)"),
});

export async function handleGetPaymentIntent(
  params: z.infer<typeof getPaymentIntentSchema>,
): Promise<string> {
  const result = await getClient().request(
    "GET",
    "/payment_intents/" + encodeURIComponent(params.payment_intent_id),
  );
  return JSON.stringify(result, null, 2);
}

export const getPaymentIntentTool: ToolDescriptor = {
  name: "get_payment_intent",
  title: "Get Payment Intent",
  description: "Retrieve a PayMongo payment intent by its ID.",
  inputSchema: getPaymentIntentSchema.shape,
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: handleGetPaymentIntent,
};
