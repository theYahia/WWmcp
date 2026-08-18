import { z } from "zod";
import { kaitenDelete, kaitenGet, kaitenPatch, kaitenPost } from "../client.js";
import { formatList, json, projectSpace } from "../lib.js";
import type { KaitenSpace, ToolDef } from "../types.js";

// --- list_spaces ---
export const listSpacesSchema = z.object({});

export async function handleListSpaces(_params: z.infer<typeof listSpacesSchema>): Promise<string> {
  return formatList<KaitenSpace>(await kaitenGet("/spaces"), "spaces", projectSpace);
}

// --- get_space ---
export const getSpaceSchema = z.object({
  space_id: z.number().int().describe("Space ID"),
});

export async function handleGetSpace(params: z.infer<typeof getSpaceSchema>): Promise<string> {
  return json(await kaitenGet(`/spaces/${params.space_id}`));
}

// --- create_space ---
export const createSpaceSchema = z.object({
  title: z.string().describe("Space title"),
  external_id: z.string().optional().describe("External ID"),
});

export async function handleCreateSpace(params: z.infer<typeof createSpaceSchema>): Promise<string> {
  const body: Record<string, unknown> = { title: params.title };
  if (params.external_id !== undefined) body.external_id = params.external_id;
  return json(await kaitenPost("/spaces", body));
}

// --- update_space ---
export const updateSpaceSchema = z.object({
  space_id: z.number().int().describe("Space ID"),
  title: z.string().optional().describe("New title"),
  access: z.enum(["for_everyone", "by_invite"]).optional().describe("Space access mode"),
});

export async function handleUpdateSpace(params: z.infer<typeof updateSpaceSchema>): Promise<string> {
  const body: Record<string, unknown> = {};
  if (params.title !== undefined) body.title = params.title;
  if (params.access !== undefined) body.access = params.access;
  return json(await kaitenPatch(`/spaces/${params.space_id}`, body));
}

// --- delete_space ---
export const deleteSpaceSchema = z.object({
  space_id: z.number().int().describe("Space ID to delete (irreversible)"),
});

export async function handleDeleteSpace(params: z.infer<typeof deleteSpaceSchema>): Promise<string> {
  return json(await kaitenDelete(`/spaces/${params.space_id}`));
}

export const tools: ToolDef[] = [
  {
    name: "list_spaces",
    description: "List all spaces in the Kaiten workspace.",
    schema: listSpacesSchema,
    handler: handleListSpaces,
  },
  { name: "get_space", description: "Get a single space by ID.", schema: getSpaceSchema, handler: handleGetSpace },
  { name: "create_space", description: "Create a new space.", schema: createSpaceSchema, handler: handleCreateSpace },
  {
    name: "update_space",
    description: "Update a space's title or access mode.",
    schema: updateSpaceSchema,
    handler: handleUpdateSpace,
  },
  {
    name: "delete_space",
    description: "Delete a space by ID. Irreversible — confirm with the user.",
    schema: deleteSpaceSchema,
    handler: handleDeleteSpace,
  },
];
