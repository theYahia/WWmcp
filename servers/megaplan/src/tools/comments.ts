import { z } from "zod";
import { megaplanGet, megaplanPost } from "../client.js";

export const getCommentsSchema = z.object({
  subject_type: z.enum(["task", "deal", "project"]).describe("Entity type to get comments for"),
  subject_id: z.string().describe("Entity ID to get comments for"),
  limit: z.number().int().min(1).max(100).default(25).describe("Results per page"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});

export async function handleGetComments(params: z.infer<typeof getCommentsSchema>): Promise<string> {
  const query: Record<string, string> = {
    limit: String(params.limit),
    offset: String(params.offset),
  };
  const result = await megaplanGet(`/${params.subject_type}/${params.subject_id}/comment`, query);
  return JSON.stringify(result, null, 2);
}

export const createCommentSchema = z.object({
  subject_type: z.enum(["task", "deal", "project"]).describe("Entity type to comment on"),
  subject_id: z.string().describe("Entity ID to comment on"),
  text: z.string().describe("Comment text (supports HTML)"),
});

export async function handleCreateComment(params: z.infer<typeof createCommentSchema>): Promise<string> {
  const body = {
    contentType: "Comment",
    text: params.text,
    subject: {
      id: params.subject_id,
      contentType: params.subject_type.charAt(0).toUpperCase() + params.subject_type.slice(1),
    },
  };
  const result = await megaplanPost(`/${params.subject_type}/${params.subject_id}/comment`, body);
  return JSON.stringify(result, null, 2);
}
