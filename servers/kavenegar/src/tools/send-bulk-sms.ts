import { z } from "zod";
import { getClient } from "../client.js";
export const sendBulkSmsSchema = z.object({
  receptors: z.array(z.string()).min(1).describe("Array of recipient phone numbers"),
  message: z.string().describe("SMS message text"),
  sender: z.string().optional().describe("Sender number"),
});

export async function handleSendBulkSms(params: z.infer<typeof sendBulkSmsSchema>): Promise<string> {
  const p: Record<string, string> = {
    receptor: params.receptors.join(","),
    message: params.message,
  };
  if (params.sender) p.sender = params.sender;
  const result = await getClient().post("sms/sendarray.json", p);
  return JSON.stringify(result, null, 2);
}
