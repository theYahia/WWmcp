import { z } from "zod";
import { bitrix24Call } from "../client.js";

export const getContactsSchema = z.object({
  filter_name: z.string().optional().describe("Filter by name (partial match)"),
  filter_phone: z.string().optional().describe("Filter by phone number"),
  filter_email: z.string().optional().describe("Filter by email"),
  start: z.number().optional().describe("Offset for pagination (multiples of 50)"),
});

export async function handleGetContacts(params: z.infer<typeof getContactsSchema>): Promise<string> {
  const filter: Record<string, unknown> = {};
  if (params.filter_name) filter["%NAME"] = params.filter_name;
  if (params.filter_phone) filter["PHONE"] = params.filter_phone;
  if (params.filter_email) filter["EMAIL"] = params.filter_email;

  const result = await bitrix24Call("crm.contact.list", {
    filter,
    select: ["ID", "NAME", "LAST_NAME", "PHONE", "EMAIL", "COMPANY_ID", "ASSIGNED_BY_ID", "DATE_CREATE"],
    start: params.start ?? 0,
  });
  return JSON.stringify(result, null, 2);
}
