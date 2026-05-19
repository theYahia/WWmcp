import { z } from "zod";
import { moyskladGet, moyskladPost } from "../client.js";
import { runInPool, buildBatchEnvelope } from "./batch-utils.js";

export const getCounterpartiesSchema = z.object({
  search: z.string().optional().describe("Search by counterparty name"),
  filter_inn: z.string().optional().describe("Filter by INN (tax ID)"),
  limit: z.number().int().min(1).max(1000).default(25).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});

export async function handleGetCounterparties(params: z.infer<typeof getCounterpartiesSchema>): Promise<string> {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit));
  query.set("offset", String(params.offset));
  if (params.search) query.set("search", params.search);
  if (params.filter_inn) query.set("filter", `inn=${params.filter_inn}`);
  const result = await moyskladGet(`/entity/counterparty?${query.toString()}`);
  return formatCounterparties(result);
}

// --- batch_create_counterparties ---
export const batchCreateCounterpartiesSchema = z.object({
  items: z.array(z.object({
    name: z.string().describe("Counterparty (customer/supplier) name. Required."),
    inn: z.string().optional().describe("INN (tax ID)"),
    kpp: z.string().optional().describe("KPP (tax registration reason code)"),
    phone: z.string().optional().describe("Phone number"),
    email: z.string().optional().describe("Email address"),
    description: z.string().optional().describe("Notes / description"),
    company_type: z.enum(["legal", "entrepreneur", "individual"]).optional().describe("Company type"),
  })).min(1).max(100).describe("Counterparties to create (1..100). Only `name` is required per MoySklad API."),
  concurrency: z.number().int().min(1).max(20).default(5).describe("Max parallel HTTP requests. Default 5."),
});

export async function handleBatchCreateCounterparties(params: z.infer<typeof batchCreateCounterpartiesSchema>): Promise<string> {
  const results = await runInPool(params.items, params.concurrency, async (item) => {
    const body: Record<string, unknown> = { name: item.name };
    if (item.inn) body.inn = item.inn;
    if (item.kpp) body.kpp = item.kpp;
    if (item.phone) body.phone = item.phone;
    if (item.email) body.email = item.email;
    if (item.description) body.description = item.description;
    if (item.company_type) body.companyType = item.company_type;
    const raw = (await moyskladPost("/entity/counterparty", body)) as Record<string, unknown>;
    return {
      id: raw.id, name: raw.name, inn: raw.inn, kpp: raw.kpp,
      phone: raw.phone, email: raw.email, companyType: raw.companyType,
    };
  });
  return JSON.stringify(buildBatchEnvelope(results), null, 2);
}

function formatCounterparties(raw: unknown): string {
  const data = raw as { meta: { size: number }; rows: Array<Record<string, unknown>> };
  return JSON.stringify({
    total: data.meta?.size,
    counterparties: (data.rows ?? []).map((c) => ({
      id: c.id, name: c.name, phone: c.phone, email: c.email, inn: c.inn, companyType: c.companyType,
    })),
  }, null, 2);
}
