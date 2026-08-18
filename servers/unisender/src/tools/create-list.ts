import { z } from "zod";
import { apiCall } from "../client.js";

export const createListSchema = z.object({
  title: z.string().describe("Название списка рассылки"),
  before_subscribe_url: z.string().optional().describe("URL страницы до подписки"),
  after_subscribe_url: z.string().optional().describe("URL страницы после подписки"),
});

export async function handleCreateList(params: z.infer<typeof createListSchema>): Promise<string> {
  const query: Record<string, string> = {
    title: params.title,
  };
  if (params.before_subscribe_url) query.before_subscribe_url = params.before_subscribe_url;
  if (params.after_subscribe_url) query.after_subscribe_url = params.after_subscribe_url;

  const data = await apiCall("createList", query);
  return JSON.stringify(data, null, 2);
}
