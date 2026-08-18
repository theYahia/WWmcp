import { z } from "zod";
import { kaitenDelete, kaitenGet, kaitenPatch, kaitenPost } from "../client.js";
import { formatList, json, projectColumn } from "../lib.js";
import type { KaitenColumn, ToolDef } from "../types.js";

const COLUMN_TYPE = "1 - queue, 2 - in progress, 3 - done";

// --- list_columns ---
export const listColumnsSchema = z.object({
  board_id: z.number().int().describe("Board ID"),
});

export async function handleListColumns(params: z.infer<typeof listColumnsSchema>): Promise<string> {
  return formatList<KaitenColumn>(await kaitenGet(`/boards/${params.board_id}/columns`), "columns", projectColumn);
}

// --- create_column ---
export const createColumnSchema = z.object({
  board_id: z.number().int().describe("Board ID"),
  title: z.string().describe("Column title"),
  type: z.number().int().optional().describe(`Column type: ${COLUMN_TYPE}`),
  sort_order: z.number().optional().describe("Position"),
  wip_limit: z.number().int().optional().describe("WIP limit"),
});

export async function handleCreateColumn(params: z.infer<typeof createColumnSchema>): Promise<string> {
  const body: Record<string, unknown> = { title: params.title };
  if (params.type !== undefined) body.type = params.type;
  if (params.sort_order !== undefined) body.sort_order = params.sort_order;
  if (params.wip_limit !== undefined) body.wip_limit = params.wip_limit;
  return json(await kaitenPost(`/boards/${params.board_id}/columns`, body));
}

// --- update_column ---
export const updateColumnSchema = z.object({
  board_id: z.number().int().describe("Board ID"),
  column_id: z.number().int().describe("Column ID"),
  title: z.string().optional().describe("New title"),
  type: z.number().int().optional().describe(`Column type: ${COLUMN_TYPE}`),
  sort_order: z.number().optional().describe("Position"),
  wip_limit: z.number().int().optional().describe("WIP limit"),
});

export async function handleUpdateColumn(params: z.infer<typeof updateColumnSchema>): Promise<string> {
  const body: Record<string, unknown> = {};
  if (params.title !== undefined) body.title = params.title;
  if (params.type !== undefined) body.type = params.type;
  if (params.sort_order !== undefined) body.sort_order = params.sort_order;
  if (params.wip_limit !== undefined) body.wip_limit = params.wip_limit;
  return json(await kaitenPatch(`/boards/${params.board_id}/columns/${params.column_id}`, body));
}

// --- delete_column ---
export const deleteColumnSchema = z.object({
  board_id: z.number().int().describe("Board ID"),
  column_id: z.number().int().describe("Column ID to delete (irreversible)"),
});

export async function handleDeleteColumn(params: z.infer<typeof deleteColumnSchema>): Promise<string> {
  return json(await kaitenDelete(`/boards/${params.board_id}/columns/${params.column_id}`));
}

export const tools: ToolDef[] = [
  {
    name: "list_columns",
    description: "List all columns (stages) of a Kaiten board.",
    schema: listColumnsSchema,
    handler: handleListColumns,
  },
  {
    name: "create_column",
    description: "Create a new column on a board.",
    schema: createColumnSchema,
    handler: handleCreateColumn,
  },
  {
    name: "update_column",
    description: "Update a column's title, type, position, or WIP limit.",
    schema: updateColumnSchema,
    handler: handleUpdateColumn,
  },
  {
    name: "delete_column",
    description: "Delete a column. Irreversible — confirm with the user.",
    schema: deleteColumnSchema,
    handler: handleDeleteColumn,
  },
];
