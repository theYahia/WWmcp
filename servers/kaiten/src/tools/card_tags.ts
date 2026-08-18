import { z } from "zod";
import { kaitenDelete, kaitenGet, kaitenPost } from "../client.js";
import { json } from "../lib.js";
import type { ToolDef } from "../types.js";

// --- list_card_tags ---
export const listCardTagsSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
});

export async function handleListCardTags(params: z.infer<typeof listCardTagsSchema>): Promise<string> {
  return json(await kaitenGet(`/cards/${params.card_id}/tags`));
}

// --- add_card_tag (POST /cards/{id}/tags { name }) — creates the tag if it doesn't exist ---
export const addCardTagSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
  name: z.string().describe("Tag name (created if it doesn't exist yet)"),
});

export async function handleAddCardTag(params: z.infer<typeof addCardTagSchema>): Promise<string> {
  return json(await kaitenPost(`/cards/${params.card_id}/tags`, { name: params.name }));
}

// --- remove_card_tag (DELETE /cards/{id}/tags/{tag_id}) ---
export const removeCardTagSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
  tag_id: z.number().int().describe("Tag ID to remove from the card"),
});

export async function handleRemoveCardTag(params: z.infer<typeof removeCardTagSchema>): Promise<string> {
  return json(await kaitenDelete(`/cards/${params.card_id}/tags/${params.tag_id}`));
}

export const tools: ToolDef[] = [
  {
    name: "list_card_tags",
    description: "List tags attached to a card.",
    schema: listCardTagsSchema,
    handler: handleListCardTags,
  },
  {
    name: "add_card_tag",
    description: "Attach a tag (by name) to a card; creates the tag if new.",
    schema: addCardTagSchema,
    handler: handleAddCardTag,
  },
  {
    name: "remove_card_tag",
    description: "Remove a tag from a card by tag ID.",
    schema: removeCardTagSchema,
    handler: handleRemoveCardTag,
  },
];
