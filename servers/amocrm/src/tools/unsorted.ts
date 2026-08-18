import { z } from "zod";
import { apiGet, apiPost } from "../client.js";

// --- list_unsorted ---
export const listUnsortedSchema = z.object({
  page: z.number().optional().describe("Page number (default 1)"),
  limit: z.number().max(250).optional().describe("Items per page (max 250, default 50)"),
  pipeline_id: z.number().optional().describe("Filter by pipeline ID"),
});

export async function handleListUnsorted(params: z.infer<typeof listUnsortedSchema>): Promise<string> {
  const qp: Record<string, string> = {};
  if (params.page) qp["page"] = String(params.page);
  if (params.limit) qp["limit"] = String(params.limit);
  if (params.pipeline_id) qp["filter[pipeline_id]"] = String(params.pipeline_id);

  const data = await apiGet<unknown>("/leads/unsorted", qp);
  return JSON.stringify(data, null, 2);
}

// --- accept_unsorted ---
export const acceptUnsortedSchema = z.object({
  uid: z.string().describe("UID of the unsorted lead to accept"),
  pipeline_id: z.number().optional().describe("Target pipeline ID"),
  status_id: z.number().optional().describe("Target status ID within the pipeline"),
  user_id: z.number().optional().describe("Responsible user ID for the accepted lead"),
});

export async function handleAcceptUnsorted(params: z.infer<typeof acceptUnsortedSchema>): Promise<string> {
  const { uid, ...body } = params;
  const data = await apiPost<unknown>(`/leads/unsorted/${uid}/accept`, body);
  return JSON.stringify(data, null, 2);
}
