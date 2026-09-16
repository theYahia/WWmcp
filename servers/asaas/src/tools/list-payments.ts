import { z } from "zod";
import { asaasRequest } from "../client.js";

export const list_paymentsSchema = z.object({
  page: z.number().default(1).describe("Page"),
  limit: z.number().default(25).describe("Limit"),
  status: z.string().optional().describe("Status filter"),
});

export async function handleListPayments(params: z.infer<typeof list_paymentsSchema>): Promise<string> {
  const query: Record<string, string> = {};
  if (params.page) query.page = String(params.page);
  if (params.limit) query.limit = String(params.limit);
  if (params.status) query.status = String(params.status);
  const result = await asaasRequest("GET", "/payments", { params: query });
  return JSON.stringify(result, null, 2);
}
