import { z } from "zod";
import { getClient } from "../client.js";
export const getDeliveryStatusSchema = z.object({
  messageid: z.string().describe("Message ID to check delivery status"),
});

export async function handleGetDeliveryStatus(params: z.infer<typeof getDeliveryStatusSchema>): Promise<string> {
  const result = await getClient().get("sms/status.json", { messageid: params.messageid });
  return JSON.stringify(result, null, 2);
}
