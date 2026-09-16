import { z } from "zod";
import { kaitenDelete, kaitenGet, kaitenPost } from "../client.js";
import { json } from "../lib.js";
import type { ToolDef } from "../types.js";

// --- list_card_children ---
export const listCardChildrenSchema = z.object({
  card_id: z.number().int().describe("Parent card ID"),
});

export async function handleListCardChildren(params: z.infer<typeof listCardChildrenSchema>): Promise<string> {
  return json(await kaitenGet(`/cards/${params.card_id}/children`));
}

// --- add_card_child (POST /cards/{id}/children { card_id }) ---
export const addCardChildSchema = z.object({
  card_id: z.number().int().describe("Parent card ID"),
  child_card_id: z.number().int().describe("ID of the card to add as a child"),
});

export async function handleAddCardChild(params: z.infer<typeof addCardChildSchema>): Promise<string> {
  return json(await kaitenPost(`/cards/${params.card_id}/children`, { card_id: params.child_card_id }));
}

// --- remove_card_child (DELETE /cards/{id}/children/{child_id}) ---
export const removeCardChildSchema = z.object({
  card_id: z.number().int().describe("Parent card ID"),
  child_card_id: z.number().int().describe("Child card ID to detach"),
});

export async function handleRemoveCardChild(params: z.infer<typeof removeCardChildSchema>): Promise<string> {
  return json(await kaitenDelete(`/cards/${params.card_id}/children/${params.child_card_id}`));
}

export const tools: ToolDef[] = [
  {
    name: "list_card_children",
    description: "List child cards of a parent card.",
    schema: listCardChildrenSchema,
    handler: handleListCardChildren,
  },
  {
    name: "add_card_child",
    description: "Add a child card to a parent card.",
    schema: addCardChildSchema,
    handler: handleAddCardChild,
  },
  {
    name: "remove_card_child",
    description: "Detach a child card from a parent card.",
    schema: removeCardChildSchema,
    handler: handleRemoveCardChild,
  },
];
