import { z } from "zod";
import { moyskladGet, moyskladPost, moyskladPut } from "../client.js";
import { buildFilter, documentFields, formatDocument, formatList, json, listQuery, meta, position } from "../lib.js";
import type { ToolDef } from "../types.js";

// --- create_customer_order ---
export const createCustomerOrderSchema = z.object({
  organization_href: z.string().describe("Meta href of the organization (seller). Get from list_organizations"),
  agent_href: z.string().describe("Meta href of the counterparty (buyer). Get from get_counterparties"),
  description: z.string().optional().describe("Order description/comment"),
  positions: z
    .array(
      z.object({
        assortment_href: z.string().describe("Meta href of the product/variant/service/bundle"),
        quantity: z.number().min(1).describe("Quantity"),
        price_rubles: z.number().optional().describe("Price per unit in RUBLES (converted to kopecks internally)"),
        discount: z.number().min(0).max(100).optional().describe("Discount percentage"),
      }),
    )
    .min(1)
    .describe("Order line items"),
});

export async function handleCreateCustomerOrder(params: z.infer<typeof createCustomerOrderSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    organization: meta(params.organization_href, "organization"),
    agent: meta(params.agent_href, "counterparty"),
    positions: params.positions.map(position),
  };
  if (params.description) body.description = params.description;
  const result = await moyskladPost("/entity/customerorder", body);
  return formatDocument(result);
}

// --- get_orders ---
export const getOrdersSchema = z.object({
  search: z.string().optional().describe("Search orders by name/number"),
  limit: z.number().int().min(1).max(1000).default(25).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
  filter_state: z.string().optional().describe("Filter by state name"),
  filter_agent: z.string().optional().describe("Filter by counterparty href"),
  order: z
    .enum(["created,desc", "created,asc", "moment,desc", "moment,asc", "sum,desc", "sum,asc"])
    .default("created,desc")
    .describe("Sort order"),
  expand: z.string().optional().describe("Expand nested entities (only applies when limit <= 100)"),
});

export async function handleGetOrders(params: z.infer<typeof getOrdersSchema>): Promise<string> {
  const filter = buildFilter([
    ["state.name", params.filter_state ?? ""],
    ["agent", params.filter_agent ?? ""],
  ]);
  const qs = listQuery({
    limit: params.limit,
    offset: params.offset,
    search: params.search,
    order: params.order,
    expand: params.expand,
    filter,
  });
  const result = await moyskladGet(`/entity/customerorder?${qs}`);
  return formatList(result, "orders", documentFields);
}

// --- get_customer_order ---
export const getCustomerOrderSchema = z.object({
  id: z.string().describe("Customer order UUID"),
});

export async function handleGetCustomerOrder(params: z.infer<typeof getCustomerOrderSchema>): Promise<string> {
  const result = await moyskladGet(`/entity/customerorder/${params.id}?expand=positions`);
  return json(result);
}

// --- update_customer_order_status ---
export const updateCustomerOrderStatusSchema = z.object({
  id: z.string().describe("Customer order UUID"),
  state_href: z.string().describe("Meta href of the new state. Get states via get_metadata for customerorder"),
});

export async function handleUpdateCustomerOrderStatus(
  params: z.infer<typeof updateCustomerOrderStatusSchema>,
): Promise<string> {
  const body = { state: meta(params.state_href, "state") };
  const result = await moyskladPut(`/entity/customerorder/${params.id}`, body);
  return formatDocument(result);
}

export const tools: ToolDef[] = [
  {
    name: "create_customer_order",
    description: "Create a customer order in MoySklad. Requires organization (seller) and agent (buyer) meta hrefs, plus at least one line item with product href and quantity. Prices in rubles are converted to kopecks internally. Supports per-line discounts.",
    schema: createCustomerOrderSchema,
    handler: handleCreateCustomerOrder,
  },
  {
    name: "get_orders",
    description: "Get customer orders with filtering and sorting. Supports search by name/number, filtering by state name or counterparty, and sorting by created date, moment, or sum. Returns paginated results with order sums in rubles. Use expand parameter for nested entities.",
    schema: getOrdersSchema,
    handler: handleGetOrders,
  },
  {
    name: "get_customer_order",
    description: "Get a single customer order by UUID with expanded positions.",
    schema: getCustomerOrderSchema,
    handler: handleGetCustomerOrder,
  },
  {
    name: "update_customer_order_status",
    description: "Change the status/state of a customer order. Get available state hrefs via get_metadata for customerorder.",
    schema: updateCustomerOrderStatusSchema,
    handler: handleUpdateCustomerOrderStatus,
  },
];
