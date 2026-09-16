import { z } from "zod";
import { getClient } from "../client.js";
import type { ToolDescriptor } from "../lib/tool.js";

export const createCheckoutSchema = z.object({
  amount: z
    .number()
    .int()
    .positive()
    .describe("Amount in centavos as an integer (e.g. 10000 = ₱100.00)."),
  currency: z.string().default("PHP").describe("ISO currency code."),
  description: z.string().optional().describe("Checkout / line-item description."),
  payment_method_types: z
    .array(z.string())
    .default(["card", "gcash", "grab_pay", "paymaya"])
    .describe(
      "Payment method types. Common PayMongo values: card, gcash, grab_pay, paymaya, billease, dob, qrph.",
    ),
  success_url: z.string().url().describe("URL to redirect to on success."),
  cancel_url: z.string().url().describe("URL to redirect to on cancel."),
});

export async function handleCreateCheckout(
  params: z.infer<typeof createCheckoutSchema>,
): Promise<string> {
  const body = {
    data: {
      attributes: {
        line_items: [
          {
            amount: params.amount,
            currency: params.currency,
            name: params.description || "Payment",
            quantity: 1,
          },
        ],
        payment_method_types: params.payment_method_types,
        success_url: params.success_url,
        cancel_url: params.cancel_url,
      },
    },
  };
  const result = await getClient().request("POST", "/checkout_sessions", body, {
    moneyMoving: true,
  });
  return JSON.stringify(result, null, 2);
}

export const createCheckoutTool: ToolDescriptor = {
  name: "create_checkout",
  title: "Create Checkout Session",
  description: "Create a hosted checkout session (returns a checkout URL).",
  inputSchema: createCheckoutSchema.shape,
  annotations: { destructiveHint: true, openWorldHint: true },
  handler: handleCreateCheckout,
};
