import { z } from "zod";
import { moyskladPost } from "../client.js";
import { formatDocument, meta, position } from "../lib.js";
import type { ToolDef } from "../types.js";

// --- create_demand ---
export const createDemandSchema = z.object({
  organization_href: z.string().describe("Meta href of the organization (seller)"),
  agent_href: z.string().describe("Meta href of the counterparty (buyer)"),
  store_href: z.string().describe("Meta href of the warehouse to ship from. Get from list_stores"),
  customer_order_href: z.string().optional().describe("Meta href of the linked customer order (optional)"),
  positions: z
    .array(
      z.object({
        assortment_href: z.string().describe("Meta href of the product/variant/service/bundle"),
        quantity: z.number().min(0.01).describe("Quantity to ship"),
        price_rubles: z.number().optional().describe("Price per unit in RUBLES"),
      }),
    )
    .min(1)
    .describe("Shipment line items"),
  description: z.string().optional().describe("Shipment description/comment"),
});

export async function handleCreateDemand(params: z.infer<typeof createDemandSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    organization: meta(params.organization_href, "organization"),
    agent: meta(params.agent_href, "counterparty"),
    store: meta(params.store_href, "store"),
    positions: params.positions.map(position),
  };
  if (params.customer_order_href) {
    body.customerOrder = meta(params.customer_order_href, "customerorder");
  }
  if (params.description) body.description = params.description;
  const result = await moyskladPost("/entity/demand", body);
  return formatDocument(result);
}

export const tools: ToolDef[] = [
  {
    name: "create_demand",
    description: "Create a shipment (demand) to fulfill a customer order. Links to a warehouse.",
    schema: createDemandSchema,
    handler: handleCreateDemand,
  },
];
