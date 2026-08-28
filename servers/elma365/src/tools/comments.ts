import { z } from "zod";
import { elmaRequest } from "../client.js";
import { pagingShape, buildListBody, formatResult } from "./_shared.js";

// Комментарии к элементам ELMA365 реализованы через ленту объекта (feed), а не через app/.../comment.
// get_comments  -> список сообщений ленты элемента
// add_comment   -> публикация сообщения в ленту элемента
// Официально: GET/POST /feed/{namespace}/{code}/{target}/message[/list], где target = ID элемента.

// --- get_comments: сообщения ленты элемента ---
export const getCommentsSchema = z.object({
  namespace: z.string().min(1).describe("Пространство имён приложения"),
  code: z.string().min(1).describe("Код приложения"),
  itemId: z.string().min(1).describe("ID элемента, к ленте которого обращаемся"),
  ...pagingShape,
});

export async function handleGetComments(params: z.infer<typeof getCommentsSchema>): Promise<string> {
  const body = buildListBody({ from: params.from, size: params.size });
  const result = await elmaRequest(
    "POST",
    `feed/${params.namespace}/${params.code}/${params.itemId}/message/list`,
    body,
  );
  return formatResult(result);
}

// --- add_comment: новое сообщение в ленте элемента ---
export const addCommentSchema = z.object({
  namespace: z.string().min(1).describe("Пространство имён приложения"),
  code: z.string().min(1).describe("Код приложения"),
  itemId: z.string().min(1).describe("ID элемента"),
  text: z.string().min(1).describe("Текст комментария"),
});

export async function handleAddComment(params: z.infer<typeof addCommentSchema>): Promise<string> {
  const result = await elmaRequest(
    "POST",
    `feed/${params.namespace}/${params.code}/${params.itemId}/message`,
    { body: params.text },
  );
  return formatResult(result);
}
