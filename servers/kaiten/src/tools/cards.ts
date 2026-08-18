import { z } from "zod";
import { kaitenDelete, kaitenGet, kaitenPatch, kaitenPost } from "../client.js";
import { buildQuery, formatList, json, projectCard } from "../lib.js";
import type { KaitenCard, ToolDef } from "../types.js";

// --- list_cards ---
// Curated subset of Kaiten's GET /cards filters (the API supports ~40).
export const listCardsSchema = z.object({
  board_id: z.number().int().optional().describe("Filter by board ID"),
  column_id: z.number().int().optional().describe("Filter by column ID"),
  lane_id: z.number().int().optional().describe("Filter by lane ID"),
  space_id: z.number().int().optional().describe("Filter by space ID"),
  query: z.string().optional().describe("Full-text search"),
  tag: z.string().optional().describe("Filter by tag name"),
  type_id: z.number().int().optional().describe("Filter by card type ID"),
  owner_id: z.number().int().optional().describe("Filter by owner user ID"),
  responsible_id: z.number().int().optional().describe("Filter by responsible user ID"),
  member_ids: z.string().optional().describe("Comma-separated member user IDs"),
  states: z.string().optional().describe("Comma-separated states: 1=queued, 2=in progress, 3=done"),
  condition: z.number().int().optional().describe("1 = on board, 2 = archived"),
  archived: z.boolean().optional().describe("Filter by archived status"),
  asap: z.boolean().optional().describe("Only ASAP cards"),
  overdue: z.boolean().optional().describe("Only overdue cards"),
  with_due_date: z.boolean().optional().describe("Only cards that have a due date"),
  due_date_after: z.string().optional().describe("Due date after (ISO 8601)"),
  due_date_before: z.string().optional().describe("Due date before (ISO 8601)"),
  order_by: z.string().optional().describe("Field to order by"),
  order_direction: z.enum(["asc", "desc"]).optional().describe("Order direction"),
  offset: z.number().int().optional().describe("Pagination offset"),
  limit: z.number().int().min(1).max(100).optional().describe("Max results (default 100)"),
});

export async function handleListCards(params: z.infer<typeof listCardsSchema>): Promise<string> {
  const qs = buildQuery({ ...params });
  return formatList<KaitenCard>(await kaitenGet(`/cards${qs}`), "cards", projectCard);
}

// --- get_card_location_history ---
export const cardLocationHistorySchema = z.object({
  card_id: z.number().int().describe("Card ID"),
});

export async function handleCardLocationHistory(params: z.infer<typeof cardLocationHistorySchema>): Promise<string> {
  return json(await kaitenGet(`/cards/${params.card_id}/location-history`));
}

// --- get_card ---
export const getCardSchema = z.object({
  card_id: z.number().int().describe("Card ID to retrieve"),
});

export async function handleGetCard(params: z.infer<typeof getCardSchema>): Promise<string> {
  return json(await kaitenGet(`/cards/${params.card_id}`));
}

// --- create_card ---
export const createCardSchema = z.object({
  title: z.string().describe("Card title"),
  board_id: z.number().int().describe("Board ID"),
  column_id: z.number().int().describe("Column ID"),
  lane_id: z.number().int().optional().describe("Lane (swimlane) ID"),
  description: z.string().optional().describe("Card description (Markdown)"),
  owner_id: z.number().int().optional().describe("Card owner user ID"),
});

export async function handleCreateCard(params: z.infer<typeof createCardSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    title: params.title,
    board_id: params.board_id,
    column_id: params.column_id,
  };
  if (params.lane_id !== undefined) body.lane_id = params.lane_id;
  if (params.description !== undefined) body.description = params.description;
  if (params.owner_id !== undefined) body.owner_id = params.owner_id;
  return json(await kaitenPost("/cards", body));
}

// --- update_card ---
export const updateCardSchema = z.object({
  card_id: z.number().int().describe("Card ID to update"),
  title: z.string().optional().describe("New title"),
  description: z.string().optional().describe("New description (Markdown)"),
  owner_id: z.number().int().optional().describe("New owner user ID"),
  due_date: z.string().optional().describe("Due date in ISO 8601 (e.g. 2026-12-31T23:59:59.000Z)"),
  asap: z.boolean().optional().describe("Mark as ASAP/expedite"),
  size_text: z.string().optional().describe("Card size estimate (free text)"),
});

export async function handleUpdateCard(params: z.infer<typeof updateCardSchema>): Promise<string> {
  const body: Record<string, unknown> = {};
  if (params.title !== undefined) body.title = params.title;
  if (params.description !== undefined) body.description = params.description;
  if (params.owner_id !== undefined) body.owner_id = params.owner_id;
  if (params.due_date !== undefined) body.due_date = params.due_date;
  if (params.asap !== undefined) body.asap = params.asap;
  if (params.size_text !== undefined) body.size_text = params.size_text;
  return json(await kaitenPatch(`/cards/${params.card_id}`, body));
}

// --- move_card ---
export const moveCardSchema = z.object({
  card_id: z.number().int().describe("Card ID to move"),
  column_id: z.number().int().optional().describe("Target column ID"),
  lane_id: z.number().int().optional().describe("Target lane (swimlane) ID"),
});

export async function handleMoveCard(params: z.infer<typeof moveCardSchema>): Promise<string> {
  const body: Record<string, unknown> = {};
  if (params.column_id !== undefined) body.column_id = params.column_id;
  if (params.lane_id !== undefined) body.lane_id = params.lane_id;
  return json(await kaitenPatch(`/cards/${params.card_id}`, body));
}

// --- delete_card ---
export const deleteCardSchema = z.object({
  card_id: z.number().int().describe("Card ID to delete (irreversible)"),
});

export async function handleDeleteCard(params: z.infer<typeof deleteCardSchema>): Promise<string> {
  return json(await kaitenDelete(`/cards/${params.card_id}`));
}

export const tools: ToolDef[] = [
  {
    name: "list_cards",
    description:
      "List cards with optional filters by board, column, and full-text query. Returns a compact projection.",
    schema: listCardsSchema,
    handler: handleListCards,
  },
  {
    name: "get_card",
    description: "Get a single card by ID with all details (full JSON).",
    schema: getCardSchema,
    handler: handleGetCard,
  },
  {
    name: "create_card",
    description: "Create a new card on a board in a specific column (and optional lane).",
    schema: createCardSchema,
    handler: handleCreateCard,
  },
  {
    name: "update_card",
    description: "Update card fields: title, description, owner, due date, ASAP flag, size.",
    schema: updateCardSchema,
    handler: handleUpdateCard,
  },
  {
    name: "move_card",
    description: "Move a card to a different column and/or lane.",
    schema: moveCardSchema,
    handler: handleMoveCard,
  },
  {
    name: "delete_card",
    description: "Delete a card by ID. This is irreversible — confirm with the user first.",
    schema: deleteCardSchema,
    handler: handleDeleteCard,
  },
  {
    name: "get_card_location_history",
    description: "Get the movement history (board/column/lane changes) of a card.",
    schema: cardLocationHistorySchema,
    handler: handleCardLocationHistory,
  },
];
