import { z } from "zod";
import { kaitenDelete, kaitenGet, kaitenPatch, kaitenPost } from "../client.js";
import { formatList, json, projectLane } from "../lib.js";
import type { KaitenLane, ToolDef } from "../types.js";

// --- list_lanes ---
export const listLanesSchema = z.object({
  board_id: z.number().int().describe("Board ID"),
});

export async function handleListLanes(params: z.infer<typeof listLanesSchema>): Promise<string> {
  return formatList<KaitenLane>(await kaitenGet(`/boards/${params.board_id}/lanes`), "lanes", projectLane);
}

// --- create_lane ---
export const createLaneSchema = z.object({
  board_id: z.number().int().describe("Board ID"),
  title: z.string().describe("Lane (swimlane) title"),
  sort_order: z.number().optional().describe("Position"),
  wip_limit: z.number().int().optional().describe("WIP limit"),
});

export async function handleCreateLane(params: z.infer<typeof createLaneSchema>): Promise<string> {
  const body: Record<string, unknown> = { title: params.title };
  if (params.sort_order !== undefined) body.sort_order = params.sort_order;
  if (params.wip_limit !== undefined) body.wip_limit = params.wip_limit;
  return json(await kaitenPost(`/boards/${params.board_id}/lanes`, body));
}

// --- update_lane ---
export const updateLaneSchema = z.object({
  board_id: z.number().int().describe("Board ID"),
  lane_id: z.number().int().describe("Lane ID"),
  title: z.string().optional().describe("New title"),
  sort_order: z.number().optional().describe("Position"),
  wip_limit: z.number().int().optional().describe("WIP limit"),
});

export async function handleUpdateLane(params: z.infer<typeof updateLaneSchema>): Promise<string> {
  const body: Record<string, unknown> = {};
  if (params.title !== undefined) body.title = params.title;
  if (params.sort_order !== undefined) body.sort_order = params.sort_order;
  if (params.wip_limit !== undefined) body.wip_limit = params.wip_limit;
  return json(await kaitenPatch(`/boards/${params.board_id}/lanes/${params.lane_id}`, body));
}

// --- delete_lane ---
export const deleteLaneSchema = z.object({
  board_id: z.number().int().describe("Board ID"),
  lane_id: z.number().int().describe("Lane ID to delete (irreversible)"),
});

export async function handleDeleteLane(params: z.infer<typeof deleteLaneSchema>): Promise<string> {
  return json(await kaitenDelete(`/boards/${params.board_id}/lanes/${params.lane_id}`));
}

export const tools: ToolDef[] = [
  {
    name: "list_lanes",
    description: "List all lanes (swimlanes/rows) of a Kaiten board.",
    schema: listLanesSchema,
    handler: handleListLanes,
  },
  {
    name: "create_lane",
    description: "Create a new lane (swimlane) on a board.",
    schema: createLaneSchema,
    handler: handleCreateLane,
  },
  {
    name: "update_lane",
    description: "Update a lane's title, position, or WIP limit.",
    schema: updateLaneSchema,
    handler: handleUpdateLane,
  },
  {
    name: "delete_lane",
    description: "Delete a lane. Irreversible — confirm with the user.",
    schema: deleteLaneSchema,
    handler: handleDeleteLane,
  },
];
