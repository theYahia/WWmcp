import { z } from "zod";
import { vkPost } from "../client.js";

export const sendMessageSchema = z.object({
  peer_id: z.number().describe("ID получателя (user_id, 2000000000+chat_id, или -group_id)"),
  message: z.string().describe("Текст сообщения"),
  attachment: z.string().optional().describe("Вложения через запятую"),
});

export async function handleSendMessage(params: z.infer<typeof sendMessageSchema>): Promise<string> {
  const p: Record<string, string> = {
    peer_id: String(params.peer_id),
    message: params.message,
    random_id: String(Math.floor(Math.random() * 2147483647)),
  };
  if (params.attachment) p.attachment = params.attachment;

  const result = await vkPost("messages.send", p);
  return JSON.stringify(result, null, 2);
}
