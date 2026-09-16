import { z } from "zod";
import { getClient } from "../client.js";
import type { ToolDescriptor } from "../lib/tool.js";

export const createSourceSchema = z.object({
  amount: z
    .number()
    .int()
    .positive()
    .describe("Amount in centavos as an integer (e.g. 5000 = ₱50.00)."),
  type: z.enum(["gcash", "grab_pay"]).describe("Source type (e-wallet)."),
  currency: z.string().default("PHP").describe("ISO currency code."),
  redirect_success: z.string().url().describe("URL to redirect to on success."),
  redirect_failed: z.string().url().describe("URL to redirect to on failure."),
});

export async function handleCreateSource(
  params: z.infer<typeof createSourceSchema>,
): Promise<string> {
  const body = {
    data: {
      attributes: {
        amount: params.amount,
        currency: params.currency,
        type: params.type,
        redirect: { success: params.redirect_success, failed: params.redirect_failed },
      },
    },
  };
  const result = await getClient().request("POST", "/sources", body, {
    moneyMoving: true,
  });
  return JSON.stringify(result, null, 2);
}

export const createSourceTool: ToolDescriptor = {
  name: "create_source",
  title: "Create Source",
  description: "Create a GCash/GrabPay payment source (returns a redirect checkout URL).",
  inputSchema: createSourceSchema.shape,
  annotations: { destructiveHint: true, openWorldHint: true },
  handler: handleCreateSource,
};
