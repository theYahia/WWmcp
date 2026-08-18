import { z } from "zod";
import { apiGet, apiPost } from "../client.js";

// --- list_companies ---
export const listCompaniesSchema = z.object({
  query: z.string().optional().describe("Search query across company name"),
  page: z.number().optional().describe("Page number (default 1)"),
  limit: z.number().max(250).optional().describe("Items per page (max 250, default 50)"),
  with: z
    .array(z.enum(["leads", "contacts", "catalog_elements"]))
    .optional()
    .describe("Related entities to embed"),
});

export async function handleListCompanies(params: z.infer<typeof listCompaniesSchema>): Promise<string> {
  const qp: Record<string, string> = {};
  if (params.page) qp["page"] = String(params.page);
  if (params.limit) qp["limit"] = String(params.limit);
  if (params.query) qp["query"] = params.query;
  if (params.with?.length) qp["with"] = params.with.join(",");

  const data = await apiGet<unknown>("/companies", qp);
  return JSON.stringify(data, null, 2);
}

// --- create_company ---
export const createCompanySchema = z.object({
  name: z.string().describe("Company name"),
  responsible_user_id: z.number().optional().describe("Responsible user ID"),
  custom_fields_values: z
    .array(
      z.object({
        field_id: z.number().describe("Custom field ID"),
        values: z.array(z.object({ value: z.unknown() })).describe("Field values"),
      }),
    )
    .optional()
    .describe("Custom field values"),
});

export async function handleCreateCompany(params: z.infer<typeof createCompanySchema>): Promise<string> {
  const data = await apiPost<unknown>("/companies", [params]);
  return JSON.stringify(data, null, 2);
}
