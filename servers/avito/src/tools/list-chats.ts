import { z } from "zod";
import { AvitoClient } from "../client.js";

const client = new AvitoClient();

export const listChatsSchema = z.object({
  user_id: z
    .number()
    .int()
    .positive()
    .optional()
    .describe(
      "Avito user_id. Если не указан — берётся из env AVITO_USER_ID.",
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe("Количество чатов (1-100, по умолчанию 50)"),
  offset: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe("Смещение для пагинации (по умолчанию 0)"),
  unread_only: z
    .boolean()
    .default(false)
    .describe("Показать только чаты с непрочитанными сообщениями"),
  item_ids: z
    .array(z.number().int().positive())
    .optional()
    .describe("Фильтр по ID объявлений (опционально)"),
});

export async function handleListChats(
  params: z.infer<typeof listChatsSchema>,
): Promise<string> {
  const userId = client.resolveUserId(params.user_id);
  const query = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.unread_only) query.set("unread_only", "true");
  if (params.item_ids && params.item_ids.length > 0) {
    query.set("item_ids", params.item_ids.join(","));
  }

  // GET /messenger/v2/accounts/{user_id}/chats
  // Source: developers.avito.ru → Messenger API.
  const result = await client.request(
    "GET",
    `/messenger/v2/accounts/${userId}/chats?${query}`,
  );
  return JSON.stringify(result, null, 2);
}
