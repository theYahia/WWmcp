import { z } from "zod";
import { AvitoClient } from "../client.js";

const client = new AvitoClient();

export const markChatReadSchema = z.object({
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
});

export async function handleMarkChatRead(
  params: z.infer<typeof markChatReadSchema>,
): Promise<string> {
  const userId = client.resolveUserId(params.user_id);
  // POST /messenger/v1/accounts/{user_id}/chats/{chat_id}/read
  // Body: пустой. Возвращает { ok: true } при успехе.
  // Source: developers.avito.ru → Messenger API → markChatAsRead.
  const result = await client.request(
    "POST",
    `/messenger/v1/accounts/${userId}/chats/${encodeURIComponent(params.chat_id)}/read`,
    {},
  );
  return JSON.stringify(result, null, 2);
}
