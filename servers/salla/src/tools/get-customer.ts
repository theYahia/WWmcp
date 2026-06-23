import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

export const getCustomerSchema = z.object({
  customer_id: z.number().int().positive().describe("Customer ID"),
});

export async function handleGetCustomer(params: z.infer<typeof getCustomerSchema>): Promise<string> {
  const result = await client.request("GET", `/customers/${params.customer_id}`);
  return JSON.stringify(result, null, 2);
}
