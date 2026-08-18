import { z } from "zod";
import { retailCrmGet, retailCrmPost } from "../client.js";
import { ok, fail, runTool, type ToolResult } from "../format/index.js";
import { siteField, pageField, limitField } from "./common.js";

// ── customer_notes_list ──────────────────────────────────────
export const customerNotesListSchema = z.object({
  filter_customer_id: z.number().int().optional().describe("Filter notes by customer RetailCRM ID"),
  filter_customer_external_id: z.string().optional().describe("Filter notes by customer externalId"),
  page: pageField,
  limit: limitField,
});

export async function handleCustomerNotesList(params: z.infer<typeof customerNotesListSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const query: Record<string, string> = { page: String(params.page), limit: String(params.limit) };
    if (params.filter_customer_id !== undefined) query["filter[customerIds][]"] = String(params.filter_customer_id);
    if (params.filter_customer_external_id) query["filter[customerExternalIds][]"] = params.filter_customer_external_id;
    const result = await retailCrmGet("/customers/notes", query);
    return ok(result);
  });
}

// ── customer_notes_create ────────────────────────────────────
export const customerNotesCreateSchema = z.object({
  customer_id: z.number().int().optional().describe("Customer RetailCRM ID the note attaches to"),
  customer_external_id: z.string().optional().describe("Customer externalId (alternative to customer_id)"),
  text: z.string().describe("Note text"),
  manager_id: z.number().int().optional().describe("Author manager ID"),
  site: siteField,
});

export async function handleCustomerNotesCreate(params: z.infer<typeof customerNotesCreateSchema>): Promise<ToolResult> {
  return runTool(async () => {
    if (params.customer_id === undefined && params.customer_external_id === undefined) {
      return fail("Provide customer_id or customer_external_id");
    }
    const customer = params.customer_id !== undefined
      ? { id: params.customer_id }
      : { externalId: params.customer_external_id };
    const note: Record<string, unknown> = { customer, text: params.text };
    if (params.manager_id !== undefined) note.managerId = params.manager_id;
    const form: Record<string, string> = { note: JSON.stringify(note) };
    if (params.site) form.site = params.site;
    const result = await retailCrmPost("/customers/notes/create", form);
    return ok(result);
  });
}

// ── customer_notes_delete ────────────────────────────────────
export const customerNotesDeleteSchema = z.object({
  id: z.number().int().describe("Note ID to delete"),
});

export async function handleCustomerNotesDelete(params: z.infer<typeof customerNotesDeleteSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const result = await retailCrmPost(`/customers/notes/${params.id}/delete`, {});
    return ok(result);
  });
}
