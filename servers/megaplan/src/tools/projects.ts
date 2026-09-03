import { z } from "zod";
import { megaplanGet } from "../client.js";
import { buildListQuery, idSchema } from "../query.js";
import { formatList, formatEntity, formatProject } from "../format.js";

export const getProjectsSchema = z.object({
  filter_status: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by status code(s). Codes are account-specific."),
  search: z.string().optional().describe("Free-text search by project name"),
  limit: z.number().int().min(1).max(100).default(25).describe("Results per page (max 100)"),
  page_after: z.string().optional().describe("Cursor: id of the last project from the previous page"),
  raw: z.boolean().optional().describe("Return raw API JSON instead of a compact summary"),
});

export async function handleGetProjects(params: z.infer<typeof getProjectsSchema>): Promise<string> {
  const query = buildListQuery({
    entity: "Project",
    limit: params.limit,
    pageAfter: params.page_after,
    status: params.filter_status,
    search: params.search,
  });
  const result = await megaplanGet("/project", query);
  return formatList(result, formatProject, params.raw);
}

export const getProjectSchema = z.object({
  id: idSchema.describe("Project ID"),
  raw: z.boolean().optional().describe("Return raw API JSON instead of a compact summary"),
});

export async function handleGetProject(params: z.infer<typeof getProjectSchema>): Promise<string> {
  const result = await megaplanGet(`/project/${params.id}`);
  return formatEntity(result, formatProject, params.raw);
}
