import { z } from "zod";
import { moyskladGet } from "../client.js";
import { formatList, json, listQuery, metaHref } from "../lib.js";
import type { ToolDef } from "../types.js";

const listParams = {
  limit: z.number().int().min(1).max(1000).default(100).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
};

// --- list_employees ---
export const listEmployeesSchema = z.object(listParams);
export async function handleListEmployees(p: z.infer<typeof listEmployeesSchema>): Promise<string> {
  const result = await moyskladGet(`/entity/employee?${listQuery(p)}`);
  return formatList(result, "employees", (e) => ({
    id: e.id,
    name: e.name,
    email: e.email,
    phone: e.phone,
    meta_href: metaHref(e),
  }));
}

// --- list_currencies ---
export const listCurrenciesSchema = z.object(listParams);
export async function handleListCurrencies(p: z.infer<typeof listCurrenciesSchema>): Promise<string> {
  const result = await moyskladGet(`/entity/currency?${listQuery(p)}`);
  return formatList(result, "currencies", (c) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    iso_code: c.isoCode,
    rate: c.rate,
    meta_href: metaHref(c),
  }));
}

// --- list_product_folders (groups) ---
export const listProductFoldersSchema = z.object(listParams);
export async function handleListProductFolders(p: z.infer<typeof listProductFoldersSchema>): Promise<string> {
  const result = await moyskladGet(`/entity/productfolder?${listQuery(p)}`);
  return formatList(result, "groups", (g) => ({
    id: g.id,
    name: g.name,
    code: g.code,
    path_name: g.pathName,
    meta_href: metaHref(g),
  }));
}

// --- get_metadata ---
export const getMetadataSchema = z.object({
  entity_type: z
    .string()
    .describe("Entity type, e.g. 'customerorder', 'product', 'demand'. Returns states, attributes, etc."),
});
export async function handleGetMetadata(p: z.infer<typeof getMetadataSchema>): Promise<string> {
  const result = await moyskladGet(`/entity/${p.entity_type}/metadata`);
  return json(result);
}

export const tools: ToolDef[] = [
  {
    name: "list_employees",
    description: "List employees (for document owners and responsible persons) with contacts and meta hrefs.",
    schema: listEmployeesSchema,
    handler: handleListEmployees,
  },
  {
    name: "list_currencies",
    description: "List currencies with ISO codes and exchange rates configured in the account.",
    schema: listCurrenciesSchema,
    handler: handleListCurrencies,
  },
  {
    name: "list_product_folders",
    description: "List product groups/folders (товарные группы) with their full path names and meta hrefs.",
    schema: listProductFoldersSchema,
    handler: handleListProductFolders,
  },
  {
    name: "get_metadata",
    description:
      "Get metadata for an entity type (states, attributes, price types). Use to find order state hrefs for update_customer_order_status.",
    schema: getMetadataSchema,
    handler: handleGetMetadata,
  },
];
