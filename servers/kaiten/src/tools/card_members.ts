import { z } from "zod";
import { kaitenDelete, kaitenGet, kaitenPatch, kaitenPost } from "../client.js";
import { json } from "../lib.js";
import type { ToolDef } from "../types.js";

// --- list_card_members ---
export const listCardMembersSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
});

export async function handleListCardMembers(params: z.infer<typeof listCardMembersSchema>): Promise<string> {
  return json(await kaitenGet(`/cards/${params.card_id}/members`));
}

// --- add_card_member (POST /cards/{id}/members { user_id }) ---
export const addCardMemberSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
  user_id: z.number().int().describe("User ID to add as a card member"),
});

export async function handleAddCardMember(params: z.infer<typeof addCardMemberSchema>): Promise<string> {
  return json(await kaitenPost(`/cards/${params.card_id}/members`, { user_id: params.user_id }));
}

// --- update_card_member_role (PATCH /cards/{id}/members/{user_id} { type }) ---
export const updateCardMemberRoleSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
  user_id: z.number().int().describe("Member user ID"),
  type: z.number().int().describe("Member role type (2 = responsible)"),
});

export async function handleUpdateCardMemberRole(params: z.infer<typeof updateCardMemberRoleSchema>): Promise<string> {
  return json(await kaitenPatch(`/cards/${params.card_id}/members/${params.user_id}`, { type: params.type }));
}

// --- remove_card_member ---
export const removeCardMemberSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
  user_id: z.number().int().describe("Member user ID to remove"),
});

export async function handleRemoveCardMember(params: z.infer<typeof removeCardMemberSchema>): Promise<string> {
  return json(await kaitenDelete(`/cards/${params.card_id}/members/${params.user_id}`));
}

export const tools: ToolDef[] = [
  {
    name: "list_card_members",
    description: "List members assigned to a card.",
    schema: listCardMembersSchema,
    handler: handleListCardMembers,
  },
  {
    name: "add_card_member",
    description: "Add a user as a member of a card.",
    schema: addCardMemberSchema,
    handler: handleAddCardMember,
  },
  {
    name: "update_card_member_role",
    description: "Change a card member's role (type 2 = responsible).",
    schema: updateCardMemberRoleSchema,
    handler: handleUpdateCardMemberRole,
  },
  {
    name: "remove_card_member",
    description: "Remove a member from a card.",
    schema: removeCardMemberSchema,
    handler: handleRemoveCardMember,
  },
];
