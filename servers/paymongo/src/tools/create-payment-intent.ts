import { z } from "zod";
import { getClient } from "../client.js";
import type { ToolDescriptor } from "../lib/tool.js";

export const createPaymentIntentSchema = z.object({
  amount: z
    .number()
    .int()
    .positive()
    .describe(
      "Amount in centavos as an integer (e.g. 10000 = ₱100.00). PayMongo minimum is usually 2000 (₱20.00) and varies by method.",
    ),
  currency: z.string().default("PHP").describe("ISO currency code (PayMongo is PHP-centric)."),
  payment_method_allowed: z
    .array(z.string())
    .default(["card", "gcash", "grab_pay", "paymaya"])
    .describe(
      "Allowed payment methods. Common PayMongo values: card, gcash, grab_pay, paymaya, billease, dob, qrph. PayMongo may add more over time.",
    ),
  description: z.string().optional().describe("Payment description"),
});

export async function handleCreatePaymentIntent(
  params: z.infer<typeof createPaymentIntentSchema>,
): Promise<string> {
  const body = {
    data: {
      attributes: {
        amount: params.amount,
        currency: params.currency,
        payment_method_allowed: params.payment_method_allowed,
        description: params.description || "",
      },
    },
  };
  const result = await getClient().request("POST", "/payment_intents", body, {
    moneyMoving: true,
  });
  return JSON.stringify(result, null, 2);
}

export const createPaymentIntentTool: ToolDescriptor = {
  name: "create_payment_intent",
  title: "Create Payment Intent",
  description:
    "Create a PayMongo payment intent — the object that tracks a payment through its lifecycle.",
  inputSchema: createPaymentIntentSchema.shape,
  annotations: { destructiveHint: true, openWorldHint: true },
  handler: handleCreatePaymentIntent,
};
