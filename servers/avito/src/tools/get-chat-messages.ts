import { z } from "zod";
import { AvitoClient } from "../client.js";

const client = new AvitoClient();

export const getChatMessagesSchema = z.object({
  chat_id: z
    .string()
    .min(1)
    .describe("ID чата Avito Messenger (получить через list_chats)"),
  user_id: z
    .number()
    .int()
    .positive()
    .optional()
    .describe(
      "Avito user_id владельца чата. Если не указан — берётся из env AVITO_USER_ID.",
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe("Количество сообщений (1-100, по умолчанию 50)"),
  offset: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe("Смещение для пагинации (по умолчанию 0)"),
});

export async function handleGetChatMessages(
  params: z.infer<typeof getChatMessagesSchema>,
): Promise<string> {
  const userId = client.resolveUserId(params.user_id);
  const query = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });

  // GET /messenger/v3/accounts/{user_id}/chats/{chat_id}/messages/
  // Source: developers.avito.ru → Messenger API → getMessages (v3).
  const result = await client.request(
    "GET",
    `/messenger/v3/accounts/${userId}/chats/${encodeURIComponent(params.chat_id)}/messages/?${query}`,
  );
  return JSON.stringify(result, null, 2);
}
