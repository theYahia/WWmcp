import { z } from "zod";
import { megaplanGet, megaplanPost } from "../client.js";

export const getDealsSchema = z.object({
  filter_status: z.string().optional().describe("Filter by deal status"),
  filter_responsible_id: z.string().optional().describe("Filter by responsible employee ID"),
  search: z.string().optional().describe("Search by deal name"),
  limit: z.number().int().min(1).max(100).default(25).describe("Results per page"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});

export async function handleGetDeals(params: z.infer<typeof getDealsSchema>): Promise<string> {
  const query: Record<string, string> = {
    limit: String(params.limit),
    offset: String(params.offset),
  };
  if (params.filter_status) query["filter[status]"] = params.filter_status;
  if (params.filter_responsible_id) query["filter[responsible]"] = params.filter_responsible_id;
  if (params.search) query["search"] = params.search;

  const result = await megaplanGet("/deal", query);
  return JSON.stringify(result, null, 2);
}

export const createDealSchema = z.object({
  name: z.string().describe("Deal name/title"),
  program_id: z.string().describe("Deal program (pipeline) ID"),
  responsible_id: z.string().optional().describe("Responsible employee ID"),
  contact_id: z.string().optional().describe("Contact/client ID"),
  amount: z.number().optional().describe("Deal amount"),
  description: z.string().optional().describe("Deal description"),
});

export async function handleCreateDeal(params: z.infer<typeof createDealSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    contentType: "Deal",
    name: params.name,
    program: { id: params.program_id, contentType: "DealProgram" },
  };
  if (params.responsible_id) body.responsible = { id: params.responsible_id, contentType: "Employee" };
  if (params.contact_id) body.contact = { id: params.contact_id, contentType: "Contractor" };
  if (params.amount != null) body.cost = params.amount;
  if (params.description) body.description = params.description;

  const result = await megaplanPost("/deal", body);
  return JSON.stringify(result, null, 2);
}
