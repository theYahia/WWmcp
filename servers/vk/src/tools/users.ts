import { z } from "zod";
import { vkGet } from "../client.js";

export const getUserSchema = z.object({
  user_ids: z.string().describe("ID пользователей через запятую или screen_name"),
  fields: z.string().default("photo_200,city,followers_count,screen_name").describe("Дополнительные поля"),
});

export async function handleGetUser(params: z.infer<typeof getUserSchema>): Promise<string> {
  const result = await vkGet("users.get", {
    user_ids: params.user_ids,
    fields: params.fields,
  });
  return JSON.stringify(result, null, 2);
}

export const getGroupsSchema = z.object({
  group_ids: z.string().describe("ID или короткие имена групп через запятую"),
  fields: z.string().default("members_count,description,activity,status").describe("Дополнительные поля"),
});

export async function handleGetGroups(params: z.infer<typeof getGroupsSchema>): Promise<string> {
  const result = await vkGet("groups.getById", {
    group_ids: params.group_ids,
    fields: params.fields,
  });
  return JSON.stringify(result, null, 2);
}
