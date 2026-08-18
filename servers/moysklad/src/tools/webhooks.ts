import { z } from "zod";
import { moyskladDelete, moyskladGet, moyskladPost, moyskladPut } from "../client.js";
import { formatList, json, listQuery } from "../lib.js";
import type { ToolDef } from "../types.js";

const WEBHOOK_ACTIONS = ["CREATE", "UPDATE", "DELETE", "PROCESSED"] as const;

// --- list_webhooks ---
export const listWebhooksSchema = z.object({
  limit: z.number().int().min(1).max(100).default(100).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});

export async function handleListWebhooks(params: z.infer<typeof listWebhooksSchema>): Promise<string> {
  const qs = listQuery({ limit: params.limit, offset: params.offset });
  const result = await moyskladGet(`/entity/webhook?${qs}`);
  return formatList(result, "webhooks", formatWebhook);
}

// --- create_webhook ---
export const createWebhookSchema = z.object({
  url: z.string().url().describe("Webhook callback URL (must be HTTPS)"),
  action: z.enum(WEBHOOK_ACTIONS).describe("Which entity action triggers the webhook"),
  entityType: z.string().describe("Entity type to watch, e.g. 'customerorder', 'product', 'demand', 'counterparty'"),
  diffType: z
    .enum(["NONE", "FIELDS"])
    .optional()
    .describe("For UPDATE webhooks: NONE (default) or FIELDS to receive changed fields"),
});

export async function handleCreateWebhook(params: z.infer<typeof createWebhookSchema>): Promise<string> {
  const body: Record<string, unknown> = { url: params.url, action: params.action, entityType: params.entityType };
  if (params.diffType) body.diffType = params.diffType;
  const result = await moyskladPost("/entity/webhook", body);
  return json(formatWebhook((result ?? {}) as Record<string, unknown>));
}

// --- update_webhook ---
export const updateWebhookSchema = z.object({
  id: z.string().describe("Webhook UUID"),
  url: z.string().url().optional().describe("New callback URL"),
  action: z.enum(WEBHOOK_ACTIONS).optional().describe("New trigger action"),
  entityType: z.string().optional().describe("New entity type to watch"),
  enabled: z.boolean().optional().describe("Enable or disable the webhook"),
  diffType: z.enum(["NONE", "FIELDS"]).optional().describe("For UPDATE webhooks: NONE or FIELDS"),
});

export async function handleUpdateWebhook(params: z.infer<typeof updateWebhookSchema>): Promise<string> {
  const body: Record<string, unknown> = {};
  if (params.url !== undefined) body.url = params.url;
  if (params.action !== undefined) body.action = params.action;
  if (params.entityType !== undefined) body.entityType = params.entityType;
  if (params.enabled !== undefined) body.enabled = params.enabled;
  if (params.diffType !== undefined) body.diffType = params.diffType;
  const result = await moyskladPut(`/entity/webhook/${params.id}`, body);
  return json(formatWebhook((result ?? {}) as Record<string, unknown>));
}

// --- delete_webhook ---
export const deleteWebhookSchema = z.object({
  id: z.string().describe("Webhook UUID to delete"),
});

export async function handleDeleteWebhook(params: z.infer<typeof deleteWebhookSchema>): Promise<string> {
  await moyskladDelete(`/entity/webhook/${params.id}`);
  return json({ success: true, deleted: params.id });
}

function formatWebhook(w: Record<string, unknown>): Record<string, unknown> {
  return {
    id: w.id,
    url: w.url,
    action: w.action,
    entityType: w.entityType,
    enabled: w.enabled,
    diffType: w.diffType,
  };
}

export const tools: ToolDef[] = [
  {
    name: "list_webhooks",
    description: "List all registered webhooks with URL, action, entity type, and status.",
    schema: listWebhooksSchema,
    handler: handleListWebhooks,
  },
  {
    name: "create_webhook",
    description: "Register a new webhook for entity events (CREATE/UPDATE/DELETE/PROCESSED).",
    schema: createWebhookSchema,
    handler: handleCreateWebhook,
  },
  {
    name: "update_webhook",
    description: "Update a webhook (URL, action, entity type, enabled state).",
    schema: updateWebhookSchema,
    handler: handleUpdateWebhook,
  },
  {
    name: "delete_webhook",
    description: "Delete a registered webhook by UUID.",
    schema: deleteWebhookSchema,
    handler: handleDeleteWebhook,
  },
];
