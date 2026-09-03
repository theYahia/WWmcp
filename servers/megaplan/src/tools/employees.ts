import { z } from "zod";
import { megaplanGet } from "../client.js";
import { buildListQuery } from "../query.js";
import { formatList, formatEmployee } from "../format.js";

export const getEmployeesSchema = z.object({
  search: z.string().optional().describe("Free-text search by employee name or email"),
  filter_department_id: z.string().optional().describe("Filter by department ID"),
  limit: z.number().int().min(1).max(100).default(25).describe("Results per page (max 100)"),
  page_after: z.string().optional().describe("Cursor: id of the last employee from the previous page"),
  raw: z.boolean().optional().describe("Return raw API JSON instead of a compact summary"),
});

export async function handleGetEmployees(params: z.infer<typeof getEmployeesSchema>): Promise<string> {
  const query = buildListQuery({
    entity: "Employee",
    limit: params.limit,
    pageAfter: params.page_after,
    refs: params.filter_department_id
      ? [{ field: "department", contentType: "Department", id: params.filter_department_id }]
      : [],
    search: params.search,
  });
  const result = await megaplanGet("/employee", query);
  return formatList(result, formatEmployee, params.raw);
}
