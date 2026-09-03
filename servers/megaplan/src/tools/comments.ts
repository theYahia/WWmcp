import { z } from "zod";
import { megaplanGet, megaplanPost } from "../client.js";
import { idSchema } from "../query.js";
import { formatList, formatEntity, formatComment } from "../format.js";

export const getCommentsSchema = z.object({
  subject_type: z.enum(["task", "deal", "project"]).describe("Entity type to get comments for"),
  subject_id: idSchema.describe("Entity ID to get comments for"),
  limit: z.number().int().min(1).max(100).default(25).describe("Results per page (max 100)"),
  page_after: z.string().optional().describe("Cursor: id of the last comment from the previous page"),
  raw: z.boolean().optional().describe("Return raw API JSON instead of a compact summary"),
});

export async function handleGetComments(params: z.infer<typeof getCommentsSchema>): Promise<string> {
  const query: Record<string, unknown> = { limit: params.limit };
  if (params.page_after) query.pageAfter = { contentType: "Comment", id: params.page_after };
  // v3 comments live at the PLURAL sub-resource /{entity}/{id}/comments.
  const result = await megaplanGet(`/${params.subject_type}/${params.subject_id}/comments`, query);
  return formatList(result, formatComment, params.raw);
}

export const createCommentSchema = z.object({
  subject_type: z.enum(["task", "deal", "project"]).describe("Entity type to comment on"),
  subject_id: idSchema.describe("Entity ID to comment on"),
  content: z.string().describe("Comment text"),
});

export async function handleCreateComment(params: z.infer<typeof createCommentSchema>): Promise<string> {
  // The subject is encoded in the URL path; the body only needs contentType + content.
  const body = { contentType: "Comment", content: params.content };
  const result = await megaplanPost(`/${params.subject_type}/${params.subject_id}/comments`, body);
  return formatEntity(result, formatComment);
}
