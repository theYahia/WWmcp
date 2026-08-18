import { z } from "zod";
import { parasutGet, parasutPatch } from "../client.js";
import { formatList, formatResource, json, jsonApiBody, listQuery } from "../lib.js";
import type { ToolDef } from "../types.js";

const page = z.number().int().min(1).default(1).describe("Page number (1-based)");
const perPage = z.number().int().min(1).max(25).default(25).describe("Items per page (max 25)");

// --- list_sales_offers ---
const listSchema = z.object({
  sort: z.string().optional().describe("Sort field, '-' prefix for desc"),
  page,
  per_page: perPage,
});

async function listSalesOffers(p: z.infer<typeof listSchema>): Promise<string> {
  const qs = listQuery({ page: p.page, pageSize: p.per_page, sort: p.sort });
  return formatList(await parasutGet(`/sales_offers?${qs}`), "sales_offers");
}

// --- get_sales_offer ---
const getSchema = z.object({
  id: z.string().describe("Sales offer (estimate/quote) ID"),
  raw: z.boolean().optional().describe("Return the full raw JSON:API payload (with details)"),
});

async function getSalesOffer(p: z.infer<typeof getSchema>): Promise<string> {
  return formatResource(await parasutGet(`/sales_offers/${p.id}?include=details,contact`), p.raw);
}

// --- update_sales_offer_status ---
const updateStatusSchema = z.object({
  id: z.string().describe("Sales offer ID"),
  status: z.enum(["accepted", "rejected", "waiting"]).describe("New offer status"),
});

async function updateStatus(p: z.infer<typeof updateStatusSchema>): Promise<string> {
  const body = jsonApiBody("sales_offers", { status: p.status });
  // The update_status body uses the resource id in data.
  (body.data as Record<string, unknown>).id = p.id;
  return json(await parasutPatch(`/sales_offers/${p.id}/update_status`, body));
}

export const tools: ToolDef[] = [
  {
    name: "list_sales_offers",
    description: "List sales offers (estimates / quotes).",
    schema: listSchema,
    handler: listSalesOffers,
  },
  {
    name: "get_sales_offer",
    description: "Get a single sales offer by ID (with details and contact).",
    schema: getSchema,
    handler: getSalesOffer,
  },
  {
    name: "update_sales_offer_status",
    description: "Set a sales offer's status to accepted, rejected, or waiting.",
    schema: updateStatusSchema,
    handler: updateStatus,
  },
];
