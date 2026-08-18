import { z } from "zod";
import { kaitenDelete, kaitenGet, kaitenPatch, kaitenPost } from "../client.js";
import { formatList, json, projectBoard } from "../lib.js";
import type { KaitenBoard, ToolDef } from "../types.js";

// --- list_boards ---
// Boards are organised under spaces. The documented list path is space-scoped;
// when space_id is omitted we fall back to /boards (works on some instances but
// isn't part of the documented API).
export const listBoardsSchema = z.object({
  space_id: z.number().int().optional().describe("Space ID (recommended). Omit to attempt listing all boards."),
});

export async function handleListBoards(params: z.infer<typeof listBoardsSchema>): Promise<string> {
  const path = params.space_id ? `/spaces/${params.space_id}/boards` : "/boards";
  return formatList<KaitenBoard>(await kaitenGet(path), "boards", projectBoard);
}

// --- get_board ---
export const getBoardSchema = z.object({
  board_id: z.number().int().describe("Board ID"),
});

export async function handleGetBoard(params: z.infer<typeof getBoardSchema>): Promise<string> {
  return json(await kaitenGet(`/boards/${params.board_id}`));
}

// --- create_board ---
export const createBoardSchema = z.object({
  space_id: z.number().int().describe("Space ID to create the board in"),
  title: z.string().describe("Board title"),
  description: z.string().optional().describe("Board description"),
});

export async function handleCreateBoard(params: z.infer<typeof createBoardSchema>): Promise<string> {
  const body: Record<string, unknown> = { title: params.title };
  if (params.description !== undefined) body.description = params.description;
  return json(await kaitenPost(`/spaces/${params.space_id}/boards`, body));
}

// --- update_board ---
export const updateBoardSchema = z.object({
  space_id: z.number().int().describe("Space ID the board belongs to"),
  board_id: z.number().int().describe("Board ID"),
  title: z.string().optional().describe("New title"),
  description: z.string().optional().describe("New description"),
});

export async function handleUpdateBoard(params: z.infer<typeof updateBoardSchema>): Promise<string> {
  const body: Record<string, unknown> = {};
  if (params.title !== undefined) body.title = params.title;
  if (params.description !== undefined) body.description = params.description;
  return json(await kaitenPatch(`/spaces/${params.space_id}/boards/${params.board_id}`, body));
}

// --- delete_board ---
export const deleteBoardSchema = z.object({
  space_id: z.number().int().describe("Space ID the board belongs to"),
  board_id: z.number().int().describe("Board ID to delete (irreversible)"),
});

export async function handleDeleteBoard(params: z.infer<typeof deleteBoardSchema>): Promise<string> {
  return json(await kaitenDelete(`/spaces/${params.space_id}/boards/${params.board_id}`));
}

export const tools: ToolDef[] = [
  {
    name: "list_boards",
    description: "List boards of a space (pass space_id), or attempt to list all boards.",
    schema: listBoardsSchema,
    handler: handleListBoards,
  },
  {
    name: "get_board",
    description: "Get a single board by ID with its columns and lanes.",
    schema: getBoardSchema,
    handler: handleGetBoard,
  },
  {
    name: "create_board",
    description: "Create a new board in a space.",
    schema: createBoardSchema,
    handler: handleCreateBoard,
  },
  {
    name: "update_board",
    description: "Update a board's title or description.",
    schema: updateBoardSchema,
    handler: handleUpdateBoard,
  },
  {
    name: "delete_board",
    description: "Delete a board. Irreversible — confirm with the user.",
    schema: deleteBoardSchema,
    handler: handleDeleteBoard,
  },
];
