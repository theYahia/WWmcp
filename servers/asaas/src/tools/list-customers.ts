import { z } from "zod";
import { asaasRequest } from "../client.js";

export const list_customersSchema = z.object({
  page: z.number().default(1).describe("Page"),
  limit: z.number().default(25).describe("Limit"),
});

export async function handleListCustomers(params: z.infer<typeof list_customersSchema>): Promise<string> {
  const query: Record<string, string> = {};
  if (params.page) query.page = String(params.page);
  if (params.limit) query.limit = String(params.limit);

  const result = await asaasRequest("GET", "/customers", { params: query });
  return JSON.stringify(result, null, 2);
}
