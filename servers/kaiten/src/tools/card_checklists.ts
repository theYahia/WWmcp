import { z } from "zod";
import { kaitenDelete, kaitenGet, kaitenPatch, kaitenPost } from "../client.js";
import { json } from "../lib.js";
import type { ToolDef } from "../types.js";

// --- create_checklist (POST /cards/{id}/checklists { name, sort_order? }) ---
export const createChecklistSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
  name: z.string().describe("Checklist name"),
  sort_order: z.number().optional().describe("Position"),
});

export async function handleCreateChecklist(params: z.infer<typeof createChecklistSchema>): Promise<string> {
  const body: Record<string, unknown> = { name: params.name };
  if (params.sort_order !== undefined) body.sort_order = params.sort_order;
  return json(await kaitenPost(`/cards/${params.card_id}/checklists`, body));
}

// --- get_checklist ---
export const getChecklistSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
  checklist_id: z.number().int().describe("Checklist ID"),
});

export async function handleGetChecklist(params: z.infer<typeof getChecklistSchema>): Promise<string> {
  return json(await kaitenGet(`/cards/${params.card_id}/checklists/${params.checklist_id}`));
}

// --- update_checklist ---
export const updateChecklistSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
  checklist_id: z.number().int().describe("Checklist ID"),
  name: z.string().optional().describe("New name"),
  sort_order: z.number().optional().describe("Position"),
});

export async function handleUpdateChecklist(params: z.infer<typeof updateChecklistSchema>): Promise<string> {
  const body: Record<string, unknown> = {};
  if (params.name !== undefined) body.name = params.name;
  if (params.sort_order !== undefined) body.sort_order = params.sort_order;
  return json(await kaitenPatch(`/cards/${params.card_id}/checklists/${params.checklist_id}`, body));
}

// --- remove_checklist ---
export const removeChecklistSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
  checklist_id: z.number().int().describe("Checklist ID to delete (irreversible)"),
});

export async function handleRemoveChecklist(params: z.infer<typeof removeChecklistSchema>): Promise<string> {
  return json(await kaitenDelete(`/cards/${params.card_id}/checklists/${params.checklist_id}`));
}

// --- add_checklist_item (POST .../items { text, checked?, ... }) ---
export const addChecklistItemSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
  checklist_id: z.number().int().describe("Checklist ID"),
  text: z.string().describe("Item text"),
  checked: z.boolean().optional().describe("Initial checked state"),
  sort_order: z.number().optional().describe("Position"),
  due_date: z.string().optional().describe("Due date (YYYY-MM-DD)"),
  responsible_id: z.number().int().optional().describe("Responsible user ID"),
});

export async function handleAddChecklistItem(params: z.infer<typeof addChecklistItemSchema>): Promise<string> {
  const body: Record<string, unknown> = { text: params.text };
  if (params.checked !== undefined) body.checked = params.checked;
  if (params.sort_order !== undefined) body.sort_order = params.sort_order;
  if (params.due_date !== undefined) body.due_date = params.due_date;
  if (params.responsible_id !== undefined) body.responsible_id = params.responsible_id;
  return json(await kaitenPost(`/cards/${params.card_id}/checklists/${params.checklist_id}/items`, body));
}

// --- update_checklist_item (toggle done, edit text, move) ---
export const updateChecklistItemSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
  checklist_id: z.number().int().describe("Checklist ID"),
  item_id: z.number().int().describe("Checklist item ID"),
  text: z.string().optional().describe("New item text"),
  checked: z.boolean().optional().describe("Checked state (toggle done)"),
  sort_order: z.number().optional().describe("Position"),
  due_date: z.string().optional().describe("Due date (YYYY-MM-DD)"),
  responsible_id: z.number().int().optional().describe("Responsible user ID"),
});

export async function handleUpdateChecklistItem(params: z.infer<typeof updateChecklistItemSchema>): Promise<string> {
  const body: Record<string, unknown> = {};
  if (params.text !== undefined) body.text = params.text;
  if (params.checked !== undefined) body.checked = params.checked;
  if (params.sort_order !== undefined) body.sort_order = params.sort_order;
  if (params.due_date !== undefined) body.due_date = params.due_date;
  if (params.responsible_id !== undefined) body.responsible_id = params.responsible_id;
  return json(
    await kaitenPatch(`/cards/${params.card_id}/checklists/${params.checklist_id}/items/${params.item_id}`, body),
  );
}

// --- remove_checklist_item ---
export const removeChecklistItemSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
  checklist_id: z.number().int().describe("Checklist ID"),
  item_id: z.number().int().describe("Checklist item ID to delete"),
});

export async function handleRemoveChecklistItem(params: z.infer<typeof removeChecklistItemSchema>): Promise<string> {
  return json(await kaitenDelete(`/cards/${params.card_id}/checklists/${params.checklist_id}/items/${params.item_id}`));
}

export const tools: ToolDef[] = [
  {
    name: "create_checklist",
    description: "Add a checklist to a card.",
    schema: createChecklistSchema,
    handler: handleCreateChecklist,
  },
  {
    name: "get_checklist",
    description: "Get a card checklist with its items.",
    schema: getChecklistSchema,
    handler: handleGetChecklist,
  },
  {
    name: "update_checklist",
    description: "Rename or reorder a card checklist.",
    schema: updateChecklistSchema,
    handler: handleUpdateChecklist,
  },
  {
    name: "remove_checklist",
    description: "Delete a checklist from a card. Irreversible.",
    schema: removeChecklistSchema,
    handler: handleRemoveChecklist,
  },
  {
    name: "add_checklist_item",
    description: "Add an item to a card checklist.",
    schema: addChecklistItemSchema,
    handler: handleAddChecklistItem,
  },
  {
    name: "update_checklist_item",
    description: "Update a checklist item (toggle done, edit text, set due/responsible).",
    schema: updateChecklistItemSchema,
    handler: handleUpdateChecklistItem,
  },
  {
    name: "remove_checklist_item",
    description: "Delete a checklist item.",
    schema: removeChecklistItemSchema,
    handler: handleRemoveChecklistItem,
  },
];
