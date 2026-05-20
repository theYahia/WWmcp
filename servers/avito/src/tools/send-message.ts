import { z } from "zod";
import { AvitoClient } from "../client.js";

const client = new AvitoClient();

export const sendMessageSchema = z.object({
  chat_id: z
    .string()
    .min(1)
    .describe("ID чата Avito Messenger (получить через list_chats)"),
  text: z
    .string()
    .min(1)
    .max(1000)
    .describe(
      "Текст сообщения (до 1000 символов). Будет отправлен как text/plain.",
    ),
  user_id: z
    .number()
    .int()
    .positive()
    .optional()
    .describe(
      "Avito user_id отправителя. Если не указан — берётся из env AVITO_USER_ID.",
    ),
});

export async function handleSendMessage(
  params: z.infer<typeof sendMessageSchema>,
): Promise<string> {
  const userId = client.resolveUserId(params.user_id);
  // POST /messenger/v1/accounts/{user_id}/chats/{chat_id}/messages
  // Body: { message: { text: "..." }, type: "text" }
  // Source: developers.avito.ru → Messenger API → sendMessage.
  const body = {
    message: { text: params.text },
    type: "text",
  };
  const result = await client.request(
    "POST",
    `/messenger/v1/accounts/${userId}/chats/${encodeURIComponent(params.chat_id)}/messages`,
    body,
  );
  return JSON.stringify(result, null, 2);
}
