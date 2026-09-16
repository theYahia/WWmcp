import { z } from "zod";
import { getClient } from "../client.js";
import type { ToolDescriptor } from "../lib/tool.js";

export const getCheckoutSchema = z.object({
  checkout_session_id: z.string().describe("Checkout session ID (cs_...)."),
});

export async function handleGetCheckout(
  params: z.infer<typeof getCheckoutSchema>,
): Promise<string> {
  const result = await getClient().request(
    "GET",
    "/checkout_sessions/" + encodeURIComponent(params.checkout_session_id),
  );
  return JSON.stringify(result, null, 2);
}

export const getCheckoutTool: ToolDescriptor = {
  name: "get_checkout",
  title: "Get Checkout Session",
  description: "Retrieve a checkout session by its ID.",
  inputSchema: getCheckoutSchema.shape,
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: handleGetCheckout,
};
