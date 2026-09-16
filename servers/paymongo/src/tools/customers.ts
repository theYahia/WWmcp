import { z } from "zod";
import { getClient } from "../client.js";
import type { ToolDescriptor } from "../lib/tool.js";

// --- create_customer ------------------------------------------------------
export const createCustomerSchema = z.object({
  first_name: z.string().describe("Customer first name."),
  last_name: z.string().describe("Customer last name."),
  email: z.string().email().describe("Customer email address."),
  phone: z.string().describe("Customer phone number (e.g. +639...)."),
  default_device: z
    .enum(["email", "phone"])
    .default("email")
    .describe("Default device channel for the customer."),
});

export async function handleCreateCustomer(
  params: z.infer<typeof createCustomerSchema>,
): Promise<string> {
  const body = {
    data: {
      attributes: {
        first_name: params.first_name,
        last_name: params.last_name,
        email: params.email,
        phone: params.phone,
        default_device: params.default_device,
      },
    },
  };
  const result = await getClient().request("POST", "/customers", body);
  return JSON.stringify(result, null, 2);
}

// --- get_customer ---------------------------------------------------------
export const getCustomerSchema = z.object({
  customer_id: z.string().describe("Customer ID (cus_...)."),
});

export async function handleGetCustomer(
  params: z.infer<typeof getCustomerSchema>,
): Promise<string> {
  const result = await getClient().request(
    "GET",
    "/customers/" + encodeURIComponent(params.customer_id),
  );
  return JSON.stringify(result, null, 2);
}

// --- list_customers -------------------------------------------------------
export const listCustomersSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .describe("Max customers to return (1–100, default 10)."),
  before: z.string().optional().describe("Cursor: return resources before this customer ID."),
  after: z.string().optional().describe("Cursor: return resources after this customer ID."),
});

export async function handleListCustomers(
  params: z.infer<typeof listCustomersSchema>,
): Promise<string> {
  const qp = new URLSearchParams();
  if (params.limit) qp.set("limit", String(params.limit));
  if (params.before) qp.set("before", params.before);
  if (params.after) qp.set("after", params.after);
  const qs = qp.toString() ? "?" + qp.toString() : "";
  const result = await getClient().request("GET", "/customers" + qs);
  return JSON.stringify(result, null, 2);
}

export const customersDescriptors: ToolDescriptor[] = [
  {
    name: "create_customer",
    title: "Create Customer",
    description: "Create a customer record (stores PII for reuse across payments).",
    inputSchema: createCustomerSchema.shape,
    annotations: { openWorldHint: true },
    handler: handleCreateCustomer,
  },
  {
    name: "get_customer",
    title: "Get Customer",
    description: "Retrieve a customer by its ID.",
    inputSchema: getCustomerSchema.shape,
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    handler: handleGetCustomer,
  },
  {
    name: "list_customers",
    title: "List Customers",
    description: "List customers with cursor pagination (before/after by customer ID).",
    inputSchema: listCustomersSchema.shape,
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    handler: handleListCustomers,
  },
];
