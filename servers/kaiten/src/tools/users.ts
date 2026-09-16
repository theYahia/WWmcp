import { z } from "zod";
import { kaitenGet } from "../client.js";
import { formatList, json, projectUser } from "../lib.js";
import type { KaitenUserRef, ToolDef } from "../types.js";

// --- list_users ---
export const listUsersSchema = z.object({});

export async function handleListUsers(_params: z.infer<typeof listUsersSchema>): Promise<string> {
  return formatList<KaitenUserRef>(await kaitenGet("/users"), "users", projectUser);
}

// --- get_current_user ---
export const getCurrentUserSchema = z.object({});

export async function handleGetCurrentUser(_params: z.infer<typeof getCurrentUserSchema>): Promise<string> {
  return json(await kaitenGet("/users/current"));
}

export const tools: ToolDef[] = [
  {
    name: "list_users",
    description: "List all users in the Kaiten workspace.",
    schema: listUsersSchema,
    handler: handleListUsers,
  },
  {
    name: "get_current_user",
    description: "Get the user the API token belongs to (identifies 'me').",
    schema: getCurrentUserSchema,
    handler: handleGetCurrentUser,
  },
];
