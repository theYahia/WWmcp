import { z } from "zod";
import { getClient } from "../client.js";
export const sendSmsSchema = z.object({
  receptor: z.string().describe("Recipient phone number (e.g. 09121234567)"),
  message: z.string().describe("SMS message text"),
  sender: z.string().optional().describe("Sender number (defaults to your default line)"),
});

export async function handleSendSms(params: z.infer<typeof sendSmsSchema>): Promise<string> {
  const p: Record<string, string> = {
    receptor: params.receptor,
    message: params.message,
  };
  if (params.sender) p.sender = params.sender;
  const result = await getClient().post("sms/send.json", p);
  return JSON.stringify(result, null, 2);
}
