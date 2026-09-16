import { z } from "zod";
import { getClient } from "../client.js";
export const listOutboxSchema = z.object({
  date_from: z.string().describe("Start date (Unix timestamp)"),
  date_to: z.string().describe("End date (Unix timestamp)"),
  sender: z.string().optional().describe("Filter by sender number"),
});

export async function handleListOutbox(params: z.infer<typeof listOutboxSchema>): Promise<string> {
  const p: Record<string, string> = {
    startdate: params.date_from,
    enddate: params.date_to,
  };
  if (params.sender) p.sender = params.sender;
  const result = await getClient().get("sms/latestoutbox.json", p);
  return JSON.stringify(result, null, 2);
}
