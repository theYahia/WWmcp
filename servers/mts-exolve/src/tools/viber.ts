import { z } from "zod";
import { exolvePost } from "../client.js";

export const sendViberMessageSchema = z.object({
  to: z.string().describe("Номер получателя (формат 7XXXXXXXXXX)"),
  text: z.string().describe("Текст сообщения Viber"),
});

export async function handleSendViberMessage(params: z.infer<typeof sendViberMessageSchema>): Promise<string> {
  const result = await exolvePost("/viber/send", {
    to: params.to,
    text: params.text,
  });
  return JSON.stringify(result, null, 2);
}
