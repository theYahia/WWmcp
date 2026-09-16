import { z } from "zod";
import { asaasRequest } from "../client.js";

export const create_customerSchema = z.object({
  name: z.string().describe("Name"),
  cpfCnpj: z.string().describe("CPF or CNPJ"),
  email: z.string().optional().describe("Email"),
});

export async function handleCreateCustomer(params: z.infer<typeof create_customerSchema>): Promise<string> {
  const result = await asaasRequest("POST", "/customers", { body: params });
  return JSON.stringify(result, null, 2);
}
