import { z } from "zod";
import { getClient } from "../client.js";
import type { ToolDescriptor } from "../lib/tool.js";

// --- create_payment_method ------------------------------------------------
// NOTE: for type "card", `details` carries raw card data. We pass
// `moneyMoving: true` so the live-mode guard also gates this tool, and the
// client never logs request bodies / echoes them in error messages.
export const createPaymentMethodSchema = z.object({
  type: z
    .string()
    .default("card")
    .describe("Payment method type, e.g. 'card' or 'paymaya'."),
  details: z
    .object({
      card_number: z.string().optional(),
      exp_month: z.number().int().optional(),
      exp_year: z.number().int().optional(),
      cvc: z.string().optional(),
    })
    .optional()
    .describe("Type-specific details. For 'card': card_number, exp_month, exp_year, cvc."),
  billing: z
    .object({
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional()
    .describe("Optional billing info (name, email, phone)."),
});

export async function handleCreatePaymentMethod(
  params: z.infer<typeof createPaymentMethodSchema>,
): Promise<string> {
  const attributes: Record<string, unknown> = { type: params.type };
  if (params.details) attributes.details = params.details;
  if (params.billing) attributes.billing = params.billing;
  const result = await getClient().request(
    "POST",
    "/payment_methods",
    { data: { attributes } },
    { moneyMoving: true },
  );
  return JSON.stringify(result, null, 2);
}

// --- get_payment_method ---------------------------------------------------
export const getPaymentMethodSchema = z.object({
  payment_method_id: z.string().describe("Payment method ID (pm_...)."),
});

export async function handleGetPaymentMethod(
  params: z.infer<typeof getPaymentMethodSchema>,
): Promise<string> {
  const result = await getClient().request(
    "GET",
    "/payment_methods/" + encodeURIComponent(params.payment_method_id),
  );
  return JSON.stringify(result, null, 2);
}

export const paymentMethodsDescriptors: ToolDescriptor[] = [
  {
    name: "create_payment_method",
    title: "Create Payment Method",
    description:
      "Create a payment method (e.g. a card) to attach to a payment intent. Handle card data with care.",
    inputSchema: createPaymentMethodSchema.shape,
    annotations: { openWorldHint: true },
    handler: handleCreatePaymentMethod,
  },
  {
    name: "get_payment_method",
    title: "Get Payment Method",
    description: "Retrieve a payment method by its ID.",
    inputSchema: getPaymentMethodSchema.shape,
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    handler: handleGetPaymentMethod,
  },
];
