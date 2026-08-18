import { z } from "zod";
import { TKassaClient } from "../client.js";

let _client: TKassaClient | null = null;
function getClient(): TKassaClient {
  if (!_client) _client = new TKassaClient();
  return _client;
}

export const addCustomerSchema = z.object({
  customer_key: z.string().describe("Уникальный ID покупателя в вашей системе"),
  email: z.string().email().optional().describe("Email покупателя"),
  phone: z.string().optional().describe("Телефон покупателя (+71234567890)"),
});
export const getCustomerSchema = z.object({
  customer_key: z.string().describe("ID покупателя для получения информации"),
});
export const removeCustomerSchema = z.object({
  customer_key: z.string().describe("ID покупателя для удаления"),
});
export const getCardListSchema = z.object({
  customer_key: z.string().describe("ID покупателя для получения списка карт"),
});
export const removeCardSchema = z.object({
  customer_key: z.string().describe("ID покупателя"),
  card_id: z.number().describe("ID карты (из get_card_list)"),
});

export async function handleAddCustomer(params: z.infer<typeof addCustomerSchema>): Promise<string> {
  const body: Record<string, unknown> = { CustomerKey: params.customer_key };
  if (params.email) body.Email = params.email;
  if (params.phone) body.Phone = params.phone;
  return JSON.stringify(await getClient().post("/AddCustomer", body), null, 2);
}

export async function handleGetCustomer(params: z.infer<typeof getCustomerSchema>): Promise<string> {
  return JSON.stringify(await getClient().post("/GetCustomer", { CustomerKey: params.customer_key }), null, 2);
}

export async function handleRemoveCustomer(params: z.infer<typeof removeCustomerSchema>): Promise<string> {
  return JSON.stringify(await getClient().post("/RemoveCustomer", { CustomerKey: params.customer_key }), null, 2);
}

export async function handleGetCardList(params: z.infer<typeof getCardListSchema>): Promise<string> {
  return JSON.stringify(await getClient().post("/GetCardList", { CustomerKey: params.customer_key }), null, 2);
}

export async function handleRemoveCard(params: z.infer<typeof removeCardSchema>): Promise<string> {
  return JSON.stringify(
    await getClient().post("/RemoveCard", { CustomerKey: params.customer_key, CardId: params.card_id }),
    null, 2
  );
}
