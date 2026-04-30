import { z } from "zod";
import { megaplanGet } from "../client.js";

export const getEmployeesSchema = z.object({
  search: z.string().optional().describe("Search by employee name or email"),
  filter_department_id: z.string().optional().describe("Filter by department ID"),
  limit: z.number().int().min(1).max(100).default(25).describe("Results per page"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});

export async function handleGetEmployees(params: z.infer<typeof getEmployeesSchema>): Promise<string> {
  const query: Record<string, string> = {
    limit: String(params.limit),
    offset: String(params.offset),
  };
  if (params.search) query["search"] = params.search;
  if (params.filter_department_id) query["filter[department]"] = params.filter_department_id;

  const result = await megaplanGet("/employee", query);
  return JSON.stringify(result, null, 2);
}
