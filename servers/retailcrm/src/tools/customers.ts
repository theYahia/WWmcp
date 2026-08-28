import { z } from "zod";
import { retailCrmGet, retailCrmPost } from "../client.js";
import { ok, runTool, toCustomerView, toCustomerSummary, presentCustomerList, type ToolResult } from "../format/index.js";
import { dateField, detailField, rawField, siteField, pageField, limitField } from "./common.js";
import type { RawCustomer } from "../types.js";

// ── list_customers ───────────────────────────────────────────
export const listCustomersSchema = z.object({
  filter_name: z.string().optional().describe("Filter by customer name (partial match)"),
  filter_email: z.string().optional().describe("Filter by email address"),
  filter_phone: z.string().optional().describe("Filter by phone number"),
  filter_date_from: dateField("Filter customers created on/after (YYYY-MM-DD)").optional(),
  filter_date_to: dateField("Filter customers created on/before (YYYY-MM-DD)").optional(),
  detail: detailField,
  raw: rawField,
  page: pageField,
  limit: limitField,
});

export async function handleListCustomers(params: z.infer<typeof listCustomersSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const query: Record<string, string> = { page: String(params.page), limit: String(params.limit) };
    if (params.filter_name) query["filter[name]"] = params.filter_name;
    if (params.filter_email) query["filter[email]"] = params.filter_email;
    if (params.filter_phone) query["filter[phone]"] = params.filter_phone;
    if (params.filter_date_from) query["filter[dateFrom]"] = params.filter_date_from;
    if (params.filter_date_to) query["filter[dateTo]"] = params.filter_date_to;

    const result = await retailCrmGet("/customers", query);
    if (params.raw) return ok(result);
    return ok(presentCustomerList(result, params.detail));
  });
}

// ── get_customer ─────────────────────────────────────────────
export const getCustomerSchema = z.object({
  id: z.string().describe("Customer ID or externalId to retrieve"),
  by: z.enum(["id", "externalId"]).default("id").describe("Lookup field: 'id' (RetailCRM ID) or 'externalId'"),
  detail: detailField,
  raw: rawField,
});

export async function handleGetCustomer(params: z.infer<typeof getCustomerSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const query: Record<string, string> = {};
    if (params.by === "externalId") query["by"] = "externalId";
    const result = await retailCrmGet(`/customers/${encodeURIComponent(params.id)}`, query) as { customer?: RawCustomer };
    if (params.raw || !result?.customer) return ok(result);
    const view = params.detail === "full" ? toCustomerView(result.customer) : toCustomerSummary(result.customer);
    return ok({ customer: view });
  });
}

// ── create_customer ──────────────────────────────────────────
export const createCustomerSchema = z.object({
  first_name: z.string().describe("Customer first name"),
  last_name: z.string().optional().describe("Customer last name"),
  patronymic: z.string().optional().describe("Customer patronymic (middle name)"),
  email: z.string().optional().describe("Customer email"),
  phones: z.array(z.string()).optional().describe("Array of phone numbers"),
  address_text: z.string().optional().describe("Full address as free text"),
  address_city: z.string().optional().describe("City"),
  address_region: z.string().optional().describe("Region/state"),
  external_id: z.string().optional().describe("External system ID for linking"),
  site: siteField,
});

function buildCustomerPayload(params: {
  first_name?: string; last_name?: string; patronymic?: string; email?: string;
  phones?: string[]; address_text?: string; address_city?: string; address_region?: string; external_id?: string;
}): Record<string, unknown> {
  const customer: Record<string, unknown> = {};
  if (params.first_name) customer.firstName = params.first_name;
  if (params.last_name) customer.lastName = params.last_name;
  if (params.patronymic) customer.patronymic = params.patronymic;
  if (params.email) customer.email = params.email;
  if (params.external_id) customer.externalId = params.external_id;
  if (params.phones?.length) customer.phones = params.phones.map(n => ({ number: n }));
  if (params.address_text || params.address_city || params.address_region) {
    const address: Record<string, string> = {};
    if (params.address_text) address.text = params.address_text;
    if (params.address_city) address.city = params.address_city;
    if (params.address_region) address.region = params.address_region;
    customer.address = address;
  }
  return customer;
}

export async function handleCreateCustomer(params: z.infer<typeof createCustomerSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const customer = buildCustomerPayload(params);
    const form: Record<string, string> = { customer: JSON.stringify(customer) };
    if (params.site) form.site = params.site;
    const result = await retailCrmPost("/customers/create", form);
    return ok(result);
  });
}

// ── update_customer ──────────────────────────────────────────
export const updateCustomerSchema = z.object({
  id: z.string().describe("Customer ID or externalId to edit"),
  by: z.enum(["id", "externalId"]).default("id").describe("Lookup field"),
  first_name: z.string().optional().describe("Updated first name"),
  last_name: z.string().optional().describe("Updated last name"),
  patronymic: z.string().optional().describe("Updated patronymic"),
  email: z.string().optional().describe("Updated email"),
  phones: z.array(z.string()).optional().describe("Replace phone numbers"),
  address_text: z.string().optional().describe("Updated full address text"),
  address_city: z.string().optional().describe("Updated city"),
  address_region: z.string().optional().describe("Updated region/state"),
  site: siteField,
});

export async function handleUpdateCustomer(params: z.infer<typeof updateCustomerSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const customer = buildCustomerPayload(params);
    const form: Record<string, string> = { customer: JSON.stringify(customer) };
    if (params.by === "externalId") form.by = "externalId";
    if (params.site) form.site = params.site;
    const result = await retailCrmPost(`/customers/${encodeURIComponent(params.id)}/edit`, form);
    return ok(result);
  });
}

// ── merge_customers ──────────────────────────────────────────
export const mergeCustomersSchema = z.object({
  result_customer_id: z.number().describe("ID of the customer to keep (the merge target)"),
  merged_customer_ids: z.array(z.number()).min(1).describe("IDs of customers to merge into the target (will be deleted)"),
});

export async function handleMergeCustomers(params: z.infer<typeof mergeCustomersSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const result = await retailCrmPost("/customers/combine", {
      resultCustomer: JSON.stringify({ id: params.result_customer_id }),
      mergedCustomers: JSON.stringify(params.merged_customer_ids.map(id => ({ id }))),
    });
    return ok(result);
  });
}

// ── customers_history ────────────────────────────────────────
export const customersHistorySchema = z.object({
  filter_since_id: z.number().int().optional().describe("Return changes after this history entry ID (incremental sync)"),
  filter_date_from: dateField("Changes on/after this date (YYYY-MM-DD)").optional(),
  filter_date_to: dateField("Changes on/before this date (YYYY-MM-DD)").optional(),
  raw: rawField,
  page: pageField,
  limit: limitField,
});

export async function handleCustomersHistory(params: z.infer<typeof customersHistorySchema>): Promise<ToolResult> {
  return runTool(async () => {
    const query: Record<string, string> = { page: String(params.page), limit: String(params.limit) };
    if (params.filter_since_id !== undefined) query["filter[sinceId]"] = String(params.filter_since_id);
    if (params.filter_date_from) query["filter[startDate]"] = params.filter_date_from;
    if (params.filter_date_to) query["filter[endDate]"] = params.filter_date_to;
    const result = await retailCrmGet("/customers/history", query);
    return ok(result);
  });
}
