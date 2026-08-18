import { z } from "zod";
import { apiGet } from "../client.js";

// --- list_events ---
export const listEventsSchema = z.object({
  page: z.number().optional().describe("Page number (default 1)"),
  limit: z.number().max(100).optional().describe("Items per page (max 100, default 50)"),
  entity: z
    .enum(["lead", "contact", "company", "task", "customer"])
    .optional()
    .describe("Filter by entity type"),
  entity_id: z.number().optional().describe("Filter by specific entity ID"),
  type: z
    .string()
    .optional()
    .describe("Filter by event type (e.g. 'lead_status_changed', 'incoming_call', 'entity_linked')"),
});

export async function handleListEvents(params: z.infer<typeof listEventsSchema>): Promise<string> {
  const qp: Record<string, string> = {};
  if (params.page) qp["page"] = String(params.page);
  if (params.limit) qp["limit"] = String(params.limit);
  if (params.entity) qp["filter[entity][]"] = params.entity;
  if (params.entity_id) qp["filter[entity_id]"] = String(params.entity_id);
  if (params.type) qp["filter[type]"] = params.type;

  const data = await apiGet<unknown>("/events", qp);
  return JSON.stringify(data, null, 2);
}
