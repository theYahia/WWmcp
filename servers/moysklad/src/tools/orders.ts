import { z } from "zod";
import { moyskladGet, moyskladPost } from "../client.js";

// --- create_customer_order ---
export const createCustomerOrderSchema = z.object({
  organization_href: z.string().describe("Meta href of the organization (seller). Get from /entity/organization"),
  agent_href: z.string().describe("Meta href of the counterparty (buyer). Get from /entity/counterparty"),
  description: z.string().optional().describe("Order description/comment"),
  positions: z.array(z.object({
    assortment_href: z.string().describe("Meta href of the product"),
    quantity: z.number().min(1).describe("Quantity"),
    price_rubles: z.number().optional().describe("Price per unit in RUBLES (converted to kopecks internally)"),
    discount: z.number().min(0).max(100).optional().describe("Discount percentage"),
  })).min(1).describe("Order line items"),
});

export async function handleCreateCustomerOrder(params: z.infer<typeof createCustomerOrderSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    organization: { meta: { href: params.organization_href, type: "organization", mediaType: "application/json" } },
    agent: { meta: { href: params.agent_href, type: "counterparty", mediaType: "application/json" } },
    positions: params.positions.map((p) => {
      const pos: Record<string, unknown> = {
        quantity: p.quantity,
        assortment: { meta: { href: p.assortment_href, type: "product", mediaType: "application/json" } },
      };
      if (p.price_rubles !== undefined) pos.price = Math.round(p.price_rubles * 100);
      if (p.discount !== undefined) pos.discount = p.discount;
      return pos;
    }),
  };
  if (params.description) body.description = params.description;
  const result = await moyskladPost("/entity/customerorder", body);
  return formatOrder(result);
}

// --- get_orders ---
export const getOrdersSchema = z.object({
  search: z.string().optional().describe("Search orders by name/number"),
  limit: z.number().int().min(1).max(1000).default(25).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
  filter_state: z.string().optional().describe("Filter by state name"),
  filter_agent: z.string().optional().describe("Filter by counterparty href"),
  order: z.enum(["created,desc", "created,asc", "moment,desc", "moment,asc", "sum,desc", "sum,asc"]).default("created,desc").describe("Sort order"),
  expand: z.string().optional().describe("Expand nested entities"),
});

export async function handleGetOrders(params: z.infer<typeof getOrdersSchema>): Promise<string> {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit));
  query.set("offset", String(params.offset));
  query.set("order", params.order);
  if (params.search) query.set("search", params.search);
  if (params.expand) query.set("expand", params.expand);
  const filters: string[] = [];
  if (params.filter_state) filters.push(`state.name=${params.filter_state}`);
  if (params.filter_agent) filters.push(`agent=${params.filter_agent}`);
  if (filters.length) query.set("filter", filters.join(";"));
  const result = await moyskladGet(`/entity/customerorder?${query.toString()}`);
  return formatOrders(result);
}

function formatOrder(raw: unknown): string {
  const o = raw as Record<string, unknown>;
  return JSON.stringify({
    id: o.id, name: o.name, moment: o.moment,
    sum_rubles: typeof o.sum === "number" ? o.sum / 100 : null,
    description: o.description, created: o.created, updated: o.updated,
  }, null, 2);
}

function formatOrders(raw: unknown): string {
  const data = raw as { meta: { size: number }; rows: Array<Record<string, unknown>> };
  return JSON.stringify({
    total: data.meta?.size,
    orders: (data.rows ?? []).map((o) => ({
      id: o.id, name: o.name, moment: o.moment,
      sum_rubles: typeof o.sum === "number" ? (o.sum as number) / 100 : null,
      description: o.description,
    })),
  }, null, 2);
}
