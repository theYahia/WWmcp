import { z } from "zod";
import { kaitenDelete, kaitenGet, kaitenPatch, kaitenPost } from "../client.js";
import { json } from "../lib.js";
import type { ToolDef } from "../types.js";

// --- list_card_blockers ---
export const listBlockersSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
});

export async function handleListBlockers(params: z.infer<typeof listBlockersSchema>): Promise<string> {
  return json(await kaitenGet(`/cards/${params.card_id}/blockers`));
}

// --- block_card (POST { reason? | blocker_card_id? }) ---
export const blockCardSchema = z.object({
  card_id: z.number().int().describe("Card ID to block"),
  reason: z.string().optional().describe("Free-text block reason"),
  blocker_card_id: z.number().int().optional().describe("ID of the card that blocks this one"),
});

export async function handleBlockCard(params: z.infer<typeof blockCardSchema>): Promise<string> {
  const body: Record<string, unknown> = {};
  if (params.reason !== undefined) body.reason = params.reason;
  if (params.blocker_card_id !== undefined) body.blocker_card_id = params.blocker_card_id;
  return json(await kaitenPost(`/cards/${params.card_id}/blockers`, body));
}

// --- update_card_blocker ---
export const updateBlockerSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
  blocker_id: z.number().int().describe("Blocker ID"),
  reason: z.string().optional().describe("New reason"),
  blocker_card_id: z.number().int().optional().describe("New blocker card ID"),
});

export async function handleUpdateBlocker(params: z.infer<typeof updateBlockerSchema>): Promise<string> {
  const body: Record<string, unknown> = {};
  if (params.reason !== undefined) body.reason = params.reason;
  if (params.blocker_card_id !== undefined) body.blocker_card_id = params.blocker_card_id;
  return json(await kaitenPatch(`/cards/${params.card_id}/blockers/${params.blocker_id}`, body));
}

// --- unblock_card (DELETE /cards/{id}/blockers/{blocker_id}) ---
export const unblockCardSchema = z.object({
  card_id: z.number().int().describe("Card ID"),
  blocker_id: z.number().int().describe("Blocker ID to release"),
});

export async function handleUnblockCard(params: z.infer<typeof unblockCardSchema>): Promise<string> {
  return json(await kaitenDelete(`/cards/${params.card_id}/blockers/${params.blocker_id}`));
}

export const tools: ToolDef[] = [
  {
    name: "list_card_blockers",
    description: "List blockers on a card.",
    schema: listBlockersSchema,
    handler: handleListBlockers,
  },
  {
    name: "block_card",
    description: "Block a card with a reason or by a blocking card.",
    schema: blockCardSchema,
    handler: handleBlockCard,
  },
  {
    name: "update_card_blocker",
    description: "Update a card blocker's reason or blocking card.",
    schema: updateBlockerSchema,
    handler: handleUpdateBlocker,
  },
  {
    name: "unblock_card",
    description: "Release (delete) a card blocker.",
    schema: unblockCardSchema,
    handler: handleUnblockCard,
  },
];
