import { z } from "zod";
import { apiGet, apiPost, apiPatch } from "../client.js";

// --- list_leads ---
export const listLeadsSchema = z.object({
  query: z.string().optional().describe("Search query across lead name, contacts, companies"),
  page: z.number().optional().describe("Page number (default 1)"),
  limit: z.number().max(250).optional().describe("Items per page (max 250, default 50)"),
  pipeline_id: z.number().optional().describe("Filter by pipeline ID"),
  statuses: z
    .array(z.object({ pipeline_id: z.number(), status_id: z.number() }))
    .optional()
    .describe("Filter by statuses: array of {pipeline_id, status_id}"),
  with: z
    .array(z.enum(["contacts", "loss_reason", "catalog_elements", "is_price_modified_by_robot", "source_id"]))
    .optional()
    .describe("Related entities to embed in response"),
});

export async function handleListLeads(params: z.infer<typeof listLeadsSchema>): Promise<string> {
  const qp: Record<string, string> = {};
  if (params.page) qp["page"] = String(params.page);
  if (params.limit) qp["limit"] = String(params.limit);
  if (params.query) qp["query"] = params.query;
  if (params.pipeline_id) qp["filter[pipeline_id]"] = String(params.pipeline_id);
  if (params.statuses) {
    params.statuses.forEach((s, i) => {
      qp[`filter[statuses][${i}][pipeline_id]`] = String(s.pipeline_id);
      qp[`filter[statuses][${i}][status_id]`] = String(s.status_id);
    });
  }
  if (params.with?.length) qp["with"] = params.with.join(",");

  const data = await apiGet<unknown>("/leads", qp);
  return JSON.stringify(data, null, 2);
}

// --- get_lead ---
export const getLeadSchema = z.object({
  lead_id: z.number().describe("Lead ID"),
  with: z
    .array(z.enum(["contacts", "catalog_elements", "loss_reason", "source_id"]))
    .optional()
    .describe("Related entities to embed"),
});

export async function handleGetLead(params: z.infer<typeof getLeadSchema>): Promise<string> {
  const qp: Record<string, string> = {};
  if (params.with?.length) qp["with"] = params.with.join(",");
  const data = await apiGet<unknown>(`/leads/${params.lead_id}`, qp);
  return JSON.stringify(data, null, 2);
}

// --- create_lead ---
export const createLeadSchema = z.object({
  name: z.string().describe("Lead name"),
  price: z.number().optional().describe("Lead budget/price"),
  pipeline_id: z.number().optional().describe("Pipeline ID"),
  status_id: z.number().optional().describe("Status ID within the pipeline"),
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

export async function handleCreateLead(params: z.infer<typeof createLeadSchema>): Promise<string> {
  const data = await apiPost<unknown>("/leads", [params]);
  return JSON.stringify(data, null, 2);
}

// --- update_lead ---
export const updateLeadSchema = z.object({
  lead_id: z.number().describe("Lead ID to update"),
  name: z.string().optional().describe("New lead name"),
  price: z.number().optional().describe("New price/budget"),
  pipeline_id: z.number().optional().describe("Move to pipeline ID"),
  status_id: z.number().optional().describe("Set status ID"),
  responsible_user_id: z.number().optional().describe("New responsible user ID"),
  custom_fields_values: z
    .array(
      z.object({
        field_id: z.number(),
        values: z.array(z.object({ value: z.unknown() })),
      }),
    )
    .optional()
    .describe("Custom field values to update"),
});

export async function handleUpdateLead(params: z.infer<typeof updateLeadSchema>): Promise<string> {
  const { lead_id, ...body } = params;
  const data = await apiPatch<unknown>(`/leads/${lead_id}`, body);
  return JSON.stringify(data, null, 2);
}
