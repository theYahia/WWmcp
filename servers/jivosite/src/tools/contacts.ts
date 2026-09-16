import { z } from "zod";
import { jivoGet, jivoPost } from "../client.js";

export const getContactsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20).describe("Количество контактов"),
  offset: z.number().int().default(0).describe("Смещение"),
  query: z.string().optional().describe("Поиск по имени, email или телефону"),
});

export async function handleGetContacts(params: z.infer<typeof getContactsSchema>): Promise<string> {
  const queryParams: Record<string, string> = {
    limit: String(params.limit),
    offset: String(params.offset),
  };
  if (params.query) queryParams.q = params.query;
  const result = await jivoGet("contacts", queryParams);
  return JSON.stringify(result, null, 2);
}

export const createContactSchema = z.object({
  name: z.string().describe("Имя контакта"),
  email: z.string().optional().describe("Email контакта"),
  phone: z.string().optional().describe("Телефон контакта"),
  description: z.string().optional().describe("Описание"),
});

export async function handleCreateContact(params: z.infer<typeof createContactSchema>): Promise<string> {
  const result = await jivoPost("contacts", params as Record<string, unknown>);
  return JSON.stringify(result, null, 2);
}
