import { z } from "zod";
import { AvitoClient } from "../client.js";

const client = new AvitoClient();

export const listMyItemsSchema = z.object({
  page: z
    .number()
    .int()
    .positive()
    .default(1)
    .describe("Номер страницы (с 1)"),
  per_page: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(25)
    .describe("Объявлений на страницу (1-100, по умолчанию 25)"),
  status: z
    .enum(["active", "old", "blocked", "rejected", "removed"])
    .optional()
    .describe("Фильтр по статусу: active | old | blocked | rejected | removed"),
  category: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("ID категории Avito для фильтрации (опционально)"),
});

export async function handleListMyItems(
  params: z.infer<typeof listMyItemsSchema>,
): Promise<string> {
  const query = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.per_page),
  });
  if (params.status) query.set("status", params.status);
  if (params.category) query.set("category", String(params.category));

  // GET /core/v1/items — list of authorized user's items.
  // Source: developers.avito.ru → Items API → getItemsInfo.
  const result = await client.request("GET", `/core/v1/items?${query}`);
  return JSON.stringify(result, null, 2);
}
