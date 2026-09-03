import { z } from "zod";
import { megaplanGet, megaplanPost } from "../client.js";
import { buildListQuery, toMoney, idSchema } from "../query.js";
import { formatList, formatEntity, formatDeal } from "../format.js";

const statusFilter = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .describe('Filter by status code(s). Codes are account-specific.');

export const getDealsSchema = z.object({
  filter_status: statusFilter,
  filter_responsible_id: z.string().optional().describe("Filter by responsible employee ID"),
  search: z.string().optional().describe("Free-text search by deal name"),
  limit: z.number().int().min(1).max(100).default(25).describe("Results per page (max 100)"),
  page_after: z.string().optional().describe("Cursor: id of the last deal from the previous page"),
  raw: z.boolean().optional().describe("Return raw API JSON instead of a compact summary"),
});

export async function handleGetDeals(params: z.infer<typeof getDealsSchema>): Promise<string> {
  const query = buildListQuery({
    entity: "Deal",
    limit: params.limit,
    pageAfter: params.page_after,
    status: params.filter_status,
    refs: params.filter_responsible_id
      ? [{ field: "responsible", contentType: "Employee", id: params.filter_responsible_id }]
      : [],
    search: params.search,
  });
  const result = await megaplanGet("/deal", query);
  return formatList(result, formatDeal, params.raw);
}

export const getDealSchema = z.object({
  id: idSchema.describe("Deal ID"),
  raw: z.boolean().optional().describe("Return raw API JSON instead of a compact summary"),
});

export async function handleGetDeal(params: z.infer<typeof getDealSchema>): Promise<string> {
  const result = await megaplanGet(`/deal/${params.id}`);
  return formatEntity(result, formatDeal, params.raw);
}

export const createDealSchema = z.object({
  name: z.string().describe("Deal name/title"),
  program_id: z.string().describe("Deal program (pipeline) ID — discover via get_deal_programs"),
  responsible_id: z.string().optional().describe("Responsible employee ID"),
  contact_id: z.string().optional().describe("Contact/client ID"),
  contact_type: z
    .enum(["human", "company"])
    .default("human")
    .describe("Whether contact_id is a person (human) or an organization (company)"),
  amount: z.number().optional().describe("Deal amount (maps to the 'price' / final-sum field)"),
  currency: z.string().default("RUB").describe("ISO currency code for amount"),
  description: z.string().optional().describe("Deal description"),
});

export async function handleCreateDeal(params: z.infer<typeof createDealSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    contentType: "Deal",
    name: params.name,
    program: { id: params.program_id, contentType: "Program" },
  };
  if (params.responsible_id) {
    body.responsible = { id: params.responsible_id, contentType: "Employee" };
  }
  if (params.contact_id) {
    const contentType = params.contact_type === "company" ? "ContractorCompany" : "ContractorHuman";
    body.contact = { id: params.contact_id, contentType };
  }
  if (params.amount != null) body.price = toMoney(params.amount, params.currency);
  if (params.description) body.description = params.description;

  const result = await megaplanPost("/deal", body);
  return formatEntity(result, formatDeal);
}

export const updateDealSchema = z.object({
  id: idSchema.describe("Deal ID to update"),
  name: z.string().optional().describe("New name/title"),
  responsible_id: z.string().optional().describe("New responsible employee ID"),
  amount: z.number().optional().describe("New deal amount (maps to 'price')"),
  currency: z.string().default("RUB").describe("ISO currency code for amount"),
  description: z.string().optional().describe("New description"),
  status: z.string().optional().describe("New status code (experimental — field shape unverified)"),
});

export async function handleUpdateDeal(params: z.infer<typeof updateDealSchema>): Promise<string> {
  const body: Record<string, unknown> = { contentType: "Deal" };
  if (params.name !== undefined) body.name = params.name;
  if (params.responsible_id) body.responsible = { id: params.responsible_id, contentType: "Employee" };
  if (params.amount != null) body.price = toMoney(params.amount, params.currency);
  if (params.description !== undefined) body.description = params.description;
  // TODO(live-verify): status may need a link-entity rather than a bare code.
  if (params.status !== undefined) body.status = params.status;

  const result = await megaplanPost(`/deal/${params.id}`, body);
  return formatEntity(result, formatDeal);
}
