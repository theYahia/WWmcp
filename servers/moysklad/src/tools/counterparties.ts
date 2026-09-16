import { z } from "zod";
import { moyskladGet, moyskladPost } from "../client.js";
import { buildFilter, formatList, json, listQuery } from "../lib.js";
import type { ToolDef } from "../types.js";

// --- get_counterparties ---
export const getCounterpartiesSchema = z.object({
  search: z.string().optional().describe("Search by counterparty name"),
  filter_inn: z.string().optional().describe("Filter by INN (tax ID)"),
  filter_phone: z.string().optional().describe("Filter by phone number"),
  limit: z.number().int().min(1).max(1000).default(25).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});

export async function handleGetCounterparties(params: z.infer<typeof getCounterpartiesSchema>): Promise<string> {
  const filter = buildFilter([
    ["inn", params.filter_inn ?? ""],
    ["phone", params.filter_phone ?? ""],
  ]);
  const qs = listQuery({ limit: params.limit, offset: params.offset, search: params.search, filter });
  const result = await moyskladGet(`/entity/counterparty?${qs}`);
  return formatList(result, "counterparties", formatCounterpartyRow);
}

// --- get_counterparty ---
export const getCounterpartySchema = z.object({
  id: z.string().describe("Counterparty UUID"),
  raw: z.boolean().optional().describe("Return the full raw MoySklad object instead of the summary"),
});

export async function handleGetCounterparty(params: z.infer<typeof getCounterpartySchema>): Promise<string> {
  const result = await moyskladGet(`/entity/counterparty/${params.id}`);
  return params.raw ? json(result) : json(formatCounterpartyRow((result ?? {}) as Record<string, unknown>));
}

// --- create_counterparty ---
export const createCounterpartySchema = z.object({
  name: z.string().describe("Counterparty name (required)"),
  inn: z.string().optional().describe("INN (tax identification number)"),
  phone: z.string().optional().describe("Phone number"),
  email: z.string().optional().describe("Email address"),
  companyType: z.enum(["legal", "entrepreneur", "individual"]).default("legal").describe("Company type"),
  description: z.string().optional().describe("Comment/description"),
});

export async function handleCreateCounterparty(params: z.infer<typeof createCounterpartySchema>): Promise<string> {
  const body: Record<string, unknown> = { name: params.name, companyType: params.companyType };
  if (params.inn) body.inn = params.inn;
  if (params.phone) body.phone = params.phone;
  if (params.email) body.email = params.email;
  if (params.description) body.description = params.description;
  const result = await moyskladPost("/entity/counterparty", body);
  return json(formatCounterpartyRow((result ?? {}) as Record<string, unknown>));
}

function formatCounterpartyRow(c: Record<string, unknown>): Record<string, unknown> {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    inn: c.inn,
    companyType: c.companyType,
  };
}

export const tools: ToolDef[] = [
  {
    name: "get_counterparties",
    description: "Search counterparties (customers and suppliers) in MoySklad by name, INN (tax ID) or phone. Returns a paginated list with id, name, phone, email, INN, and company type. Use filter_inn for exact tax ID lookup. Supports offset-based pagination.",
    schema: getCounterpartiesSchema,
    handler: handleGetCounterparties,
  },
  {
    name: "get_counterparty",
    description: "Get full details of a counterparty by UUID. Pass raw:true for the untouched MoySklad object.",
    schema: getCounterpartySchema,
    handler: handleGetCounterparty,
  },
  {
    name: "create_counterparty",
    description: "Create a new counterparty. Set companyType to 'legal', 'entrepreneur', or 'individual'.",
    schema: createCounterpartySchema,
    handler: handleCreateCounterparty,
  },
];
