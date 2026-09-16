import { z } from "zod";
import { kaitenDelete, kaitenGet, kaitenPatch, kaitenPost } from "../client.js";
import { formatList, json, projectComment } from "../lib.js";
import type { KaitenComment, ToolDef } from "../types.js";

// --- add_comment (verified: POST /cards/{id}/comments { text }) ---
export const addCardCommentSchema = z.object({
  card_id: z.number().int().describe("Card ID to comment on"),
  text: z.string().describe("Comment text (Markdown)"),
});

export async function handleAddCardComment(params: z.infer<typeof addCardCommentSchema>): Promise<string> {
  return json(await kaitenPost(`/cards/${params.card_id}/comments`, { text: params.text }));
}

// --- list_comments ---
export const listCommentsSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
});

export async function handleListComments(params: z.infer<typeof listCommentsSchema>): Promise<string> {
  return formatList<KaitenComment>(await kaitenGet(`/cards/${params.card_id}/comments`), "comments", projectComment);
}

// --- update_comment ---
export const updateCommentSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
  comment_id: z.number().int().describe("Comment ID to edit"),
  text: z.string().describe("New comment text (Markdown)"),
});

export async function handleUpdateComment(params: z.infer<typeof updateCommentSchema>): Promise<string> {
  return json(await kaitenPatch(`/cards/${params.card_id}/comments/${params.comment_id}`, { text: params.text }));
}

// --- delete_comment ---
export const deleteCommentSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
  comment_id: z.number().int().describe("Comment ID to delete (irreversible)"),
});

export async function handleDeleteComment(params: z.infer<typeof deleteCommentSchema>): Promise<string> {
  return json(await kaitenDelete(`/cards/${params.card_id}/comments/${params.comment_id}`));
}

export const tools: ToolDef[] = [
  {
    name: "add_comment",
    description: "Add a comment to a Kaiten card.",
    schema: addCardCommentSchema,
    handler: handleAddCardComment,
  },
  {
    name: "list_comments",
    description: "List comments on a card.",
    schema: listCommentsSchema,
    handler: handleListComments,
  },
  {
    name: "update_comment",
    description: "Edit the text of an existing card comment.",
    schema: updateCommentSchema,
    handler: handleUpdateComment,
  },
  {
    name: "delete_comment",
    description: "Delete a card comment by ID. Irreversible.",
    schema: deleteCommentSchema,
    handler: handleDeleteComment,
  },
];
