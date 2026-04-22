import { z } from "zod";
import { megaplanGet } from "../client.js";

export const getProjectsSchema = z.object({
  filter_status: z.string().optional().describe("Filter by status (active, completed, etc.)"),
  search: z.string().optional().describe("Search by project name"),
  limit: z.number().int().min(1).max(100).default(25).describe("Results per page"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});

export async function handleGetProjects(params: z.infer<typeof getProjectsSchema>): Promise<string> {
  const query: Record<string, string> = {
    limit: String(params.limit),
    offset: String(params.offset),
  };
  if (params.filter_status) query["filter[status]"] = params.filter_status;
  if (params.search) query["search"] = params.search;

  const result = await megaplanGet("/project", query);
  return JSON.stringify(result, null, 2);
}
