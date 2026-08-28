import { z } from "zod";
import { planfixPost } from "../client.js";
import { formatCommentList, formatCreated } from "../format.js";

const COMMENT_FIELDS = "id,dateTime,owner,description,isPinned,isHidden";

export const getCommentsSchema = z.object({
  taskId: z.number().describe("ID задачи"),
  offset: z.number().optional().describe("Смещение для пагинации (по умолчанию 0)"),
  pageSize: z.number().optional().describe("Количество комментариев на странице (по умолчанию 100)"),
  fields: z.string().optional().describe(`Список полей через запятую (по умолчанию: ${COMMENT_FIELDS})`),
});

export async function handleGetComments(params: z.infer<typeof getCommentsSchema>): Promise<string> {
  const offset = params.offset ?? 0;
  const pageSize = params.pageSize ?? 100;
  // Planfix использует МНОЖЕСТВЕННОЕ число пути: /task/{id}/comments/list
  const result = await planfixPost(`task/${params.taskId}/comments/list`, {
    offset,
    pageSize,
    fields: params.fields ?? COMMENT_FIELDS,
  });
  return formatCommentList(result, pageSize, offset);
}

export const addCommentSchema = z.object({
  taskId: z.number().describe("ID задачи"),
  body: z.string().describe("Текст комментария"),
});

export async function handleAddComment(params: z.infer<typeof addCommentSchema>): Promise<string> {
  // Путь — МНОЖЕСТВЕННОЕ число: /task/{id}/comments/. Поле текста — `description`.
  const result = await planfixPost(`task/${params.taskId}/comments/`, {
    description: params.body,
  });
  return formatCreated("Комментарий", result);
}
