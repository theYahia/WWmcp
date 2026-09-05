import { z } from "zod";
import { moyskladGet } from "../client.js";
import { buildFilter, formatList, json, listQuery } from "../lib.js";
import type { ToolDef } from "../types.js";

// --- get_audit (event log) ---
export const getAuditSchema = z.object({
  moment_from: z.string().optional().describe("Start date, ISO 8601"),
  moment_to: z.string().optional().describe("End date, ISO 8601"),
  limit: z.number().int().min(1).max(1000).default(25).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});
export async function handleGetAudit(p: z.infer<typeof getAuditSchema>): Promise<string> {
  const filter = buildFilter([
    ["moment", p.moment_from ? `${p.moment_from} 00:00:00` : "", ">="],
    ["moment", p.moment_to ? `${p.moment_to} 23:59:59` : "", "<="],
  ]);
  const qs = listQuery({ limit: p.limit, offset: p.offset, filter });
  const result = await moyskladGet(`/audit?${qs}`);
  return formatList(result, "events", (e) => ({
    moment: e.moment,
    event_type: e.eventType,
    entity_type: e.entityType,
    name: e.name,
    source: e.source,
    uid: e.uid,
  }));
}

// --- get_entity_audit (history of one entity) ---
export const getEntityAuditSchema = z.object({
  entity_type: z.string().describe("Entity type, e.g. 'customerorder', 'product'"),
  id: z.string().describe("Entity UUID"),
});
export async function handleGetEntityAudit(p: z.infer<typeof getEntityAuditSchema>): Promise<string> {
  const result = await moyskladGet(`/entity/${p.entity_type}/${p.id}/audit`);
  return json(result);
}

export const tools: ToolDef[] = [
  {
    name: "get_audit",
    description: "Get the account audit/event log: who changed what and when, filtered by date range.",
    schema: getAuditSchema,
    handler: handleGetAudit,
  },
  {
    name: "get_entity_audit",
    description: "Get the change history of a single entity by type and UUID.",
    schema: getEntityAuditSchema,
    handler: handleGetEntityAudit,
  },
];
