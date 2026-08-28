import { z } from "zod";
import { elmaRequest } from "../client.js";
import { pagingShape, buildListBody, formatResult, extractFirstItem } from "./_shared.js";

// --- get_users: список пользователей ---
// Официально: GET/POST /user/list. POST-вариант поддерживает фильтрацию и пагинацию в теле.
export const getUsersSchema = z.object({
  ...pagingShape,
  filter: z.record(z.string(), z.unknown()).optional().describe("Фильтр по полям пользователя, например {\"email\": \"...\"}"),
});

export async function handleGetUsers(params: z.infer<typeof getUsersSchema>): Promise<string> {
  const body = buildListBody({ from: params.from, size: params.size, filter: params.filter });
  const result = await elmaRequest("POST", "user/list", body);
  return formatResult(result);
}

// --- get_user_by_id: один пользователь по id ---
// Официально отдельного /user/{id} НЕТ. Запрашиваем POST /user/list с фильтром по ids и возвращаем первого.
export const getUserByIdSchema = z.object({
  id: z.string().min(1).describe("ID пользователя (UUID)"),
});

export async function handleGetUserById(params: z.infer<typeof getUserByIdSchema>): Promise<string> {
  const result = await elmaRequest("POST", "user/list", { ids: [params.id], size: 1 });
  const first = extractFirstItem(result);
  return formatResult(first ?? result);
}
