import { z } from "zod";
import { jivoGet, jivoPost, jivoDelete } from "../client.js";

export const getWebhooksSchema = z.object({});

export async function handleGetWebhooks(): Promise<string> {
  const result = await jivoGet("webhooks");
  return JSON.stringify(result, null, 2);
}

export const createWebhookSchema = z.object({
  url: z.string().url().describe("URL для вебхука"),
  event: z.string().describe("Событие: chat_accepted, chat_finished, msg_new, offline_message"),
});

export async function handleCreateWebhook(params: z.infer<typeof createWebhookSchema>): Promise<string> {
  const result = await jivoPost("webhooks", params as Record<string, unknown>);
  return JSON.stringify(result, null, 2);
}

export const deleteWebhookSchema = z.object({
  webhook_id: z.string().describe("ID вебхука для удаления"),
});

export async function handleDeleteWebhook(params: z.infer<typeof deleteWebhookSchema>): Promise<string> {
  const result = await jivoDelete(`webhooks/${params.webhook_id}`);
  return JSON.stringify(result, null, 2);
}
