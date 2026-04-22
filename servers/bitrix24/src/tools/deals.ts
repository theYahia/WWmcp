import { z } from "zod";
import { bitrix24Call } from "../client.js";

export const getDealsSchema = z.object({
  filter_stage_id: z.string().optional().describe("Filter by stage ID (e.g. NEW, WON, LOSE)"),
  filter_assigned_by_id: z.number().optional().describe("Filter by responsible user ID"),
  start: z.number().optional().describe("Offset for pagination (multiples of 50)"),
});

export async function handleGetDeals(params: z.infer<typeof getDealsSchema>): Promise<string> {
  const filter: Record<string, unknown> = {};
  if (params.filter_stage_id) filter["STAGE_ID"] = params.filter_stage_id;
  if (params.filter_assigned_by_id) filter["ASSIGNED_BY_ID"] = params.filter_assigned_by_id;

  const result = await bitrix24Call("crm.deal.list", {
    filter,
    select: ["ID", "TITLE", "STAGE_ID", "OPPORTUNITY", "CURRENCY_ID", "CONTACT_ID", "COMPANY_ID", "ASSIGNED_BY_ID", "DATE_CREATE", "CLOSEDATE"],
    start: params.start ?? 0,
  });
  return JSON.stringify(result, null, 2);
}

export const createDealSchema = z.object({
  title: z.string().describe("Deal title"),
  stage_id: z.string().default("NEW").describe("Stage ID (e.g. NEW, PREPARATION, PREPAYMENT_INVOICE)"),
  opportunity: z.number().optional().describe("Deal amount"),
  currency_id: z.string().default("RUB").describe("Currency code"),
  contact_id: z.number().optional().describe("Contact ID to link"),
  company_id: z.number().optional().describe("Company ID to link"),
  assigned_by_id: z.number().optional().describe("Responsible user ID"),
  comments: z.string().optional().describe("Comments"),
});

export async function handleCreateDeal(params: z.infer<typeof createDealSchema>): Promise<string> {
  const fields: Record<string, unknown> = {
    TITLE: params.title,
    STAGE_ID: params.stage_id,
    CURRENCY_ID: params.currency_id,
  };
  if (params.opportunity !== undefined) fields.OPPORTUNITY = params.opportunity;
  if (params.contact_id !== undefined) fields.CONTACT_ID = params.contact_id;
  if (params.company_id !== undefined) fields.COMPANY_ID = params.company_id;
  if (params.assigned_by_id !== undefined) fields.ASSIGNED_BY_ID = params.assigned_by_id;
  if (params.comments !== undefined) fields.COMMENTS = params.comments;

  const result = await bitrix24Call("crm.deal.add", { fields });
  return JSON.stringify(result, null, 2);
}
