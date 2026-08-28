import { z } from "zod";
import { apiCall } from "../client.js";

export const sendEmailSchema = z.object({
  message_id: z.number().describe("ID письма из create_email"),
});

export async function handleSendEmail(params: z.infer<typeof sendEmailSchema>): Promise<string> {
  const data = await apiCall("createCampaign", {
    message_id: String(params.message_id),
  });
  return JSON.stringify(data, null, 2);
}
