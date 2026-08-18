import { z } from "zod";
import { megaplanGet } from "../client.js";
import { buildListQuery, idSchema } from "../query.js";
import { formatList, formatEntity, formatClient } from "../format.js";

// In v3 contractors are split into two entities: people (contractorHuman) and
// organizations (contractorCompany). The `type` param selects which.

function pathFor(type: "human" | "company"): string {
  return type === "company" ? "contractorCompany" : "contractorHuman";
}
function entityFor(type: "human" | "company"): string {
  return type === "company" ? "ContractorCompany" : "ContractorHuman";
}

export const listClientsSchema = z.object({
  type: z.enum(["human", "company"]).default("human").describe("Person (human) or organization (company)"),
  search: z.string().optional().describe("Free-text search by name"),
  limit: z.number().int().min(1).max(100).default(25).describe("Results per page (max 100)"),
  page_after: z.string().optional().describe("Cursor: id of the last client from the previous page"),
  raw: z.boolean().optional().describe("Return raw API JSON instead of a compact summary"),
});

export async function handleListClients(params: z.infer<typeof listClientsSchema>): Promise<string> {
  const query = buildListQuery({
    entity: entityFor(params.type),
    limit: params.limit,
    pageAfter: params.page_after,
    search: params.search,
  });
  const result = await megaplanGet(`/${pathFor(params.type)}`, query);
  return formatList(result, formatClient, params.raw);
}

export const getClientSchema = z.object({
  type: z.enum(["human", "company"]).default("human").describe("Person (human) or organization (company)"),
  id: idSchema.describe("Client ID"),
  raw: z.boolean().optional().describe("Return raw API JSON instead of a compact summary"),
});

export async function handleGetClient(params: z.infer<typeof getClientSchema>): Promise<string> {
  const result = await megaplanGet(`/${pathFor(params.type)}/${params.id}`);
  return formatEntity(result, formatClient, params.raw);
}
