import { z } from "zod";
import { getClient } from "../client.js";

export const createWebhookSchema = z.object({
  event: z.enum([
    "payment.succeeded",
    "payment.waiting_for_capture",
    "payment.canceled",
    "refund.succeeded",
    "payout.succeeded",
    "payout.canceled",
    "deal.closed",
  ]).describe("Event type to subscribe to"),
  url: z.string().url().describe("HTTPS URL to receive webhook notifications"),
});

export const listWebhooksSchema = z.object({});

export const deleteWebhookSchema = z.object({
  webhook_id: z.string().describe("ID of the webhook to delete"),
});

export async function handleCreateWebhook(params: z.infer<typeof createWebhookSchema>): Promise<string> {
  const body = {
    event: params.event,
    url: params.url,
  };

  const result = await getClient().post("/webhooks", body);
  return JSON.stringify(result, null, 2);
}

export async function handleListWebhooks(): Promise<string> {
  const result = await getClient().get("/webhooks");
  return JSON.stringify(result, null, 2);
}

export async function handleDeleteWebhook(params: z.infer<typeof deleteWebhookSchema>): Promise<string> {
  const result = await getClient().delete(`/webhooks/${params.webhook_id}`);
  return JSON.stringify(result, null, 2);
}
