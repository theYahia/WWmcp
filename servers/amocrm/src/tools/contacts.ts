import { z } from "zod";
import { apiGet, apiPost } from "../client.js";

// --- list_contacts ---
export const listContactsSchema = z.object({
  query: z.string().optional().describe("Search query across contact name, phone, email"),
  page: z.number().optional().describe("Page number (default 1)"),
  limit: z.number().max(250).optional().describe("Items per page (max 250, default 50)"),
  with: z
    .array(z.enum(["leads", "customers", "catalog_elements"]))
    .optional()
    .describe("Related entities to embed"),
});

export async function handleListContacts(params: z.infer<typeof listContactsSchema>): Promise<string> {
  const qp: Record<string, string> = {};
  if (params.page) qp["page"] = String(params.page);
  if (params.limit) qp["limit"] = String(params.limit);
  if (params.query) qp["query"] = params.query;
  if (params.with?.length) qp["with"] = params.with.join(",");

  const data = await apiGet<unknown>("/contacts", qp);
  return JSON.stringify(data, null, 2);
}

// --- get_contact ---
export const getContactSchema = z.object({
  contact_id: z.number().describe("Contact ID"),
  with: z
    .array(z.enum(["leads", "customers", "catalog_elements"]))
    .optional()
    .describe("Related entities to embed"),
});

export async function handleGetContact(params: z.infer<typeof getContactSchema>): Promise<string> {
  const qp: Record<string, string> = {};
  if (params.with?.length) qp["with"] = params.with.join(",");
  const data = await apiGet<unknown>(`/contacts/${params.contact_id}`, qp);
  return JSON.stringify(data, null, 2);
}

// --- create_contact ---
export const createContactSchema = z.object({
  name: z.string().optional().describe("Full contact name"),
  first_name: z.string().optional().describe("First name"),
  last_name: z.string().optional().describe("Last name"),
  responsible_user_id: z.number().optional().describe("Responsible user ID"),
  custom_fields_values: z
    .array(
      z.object({
        field_id: z.number().describe("Custom field ID"),
        values: z.array(z.object({ value: z.unknown() })).describe("Field values"),
      }),
    )
    .optional()
    .describe("Custom field values (phone, email, etc.)"),
});

export async function handleCreateContact(params: z.infer<typeof createContactSchema>): Promise<string> {
  const data = await apiPost<unknown>("/contacts", [params]);
  return JSON.stringify(data, null, 2);
}
