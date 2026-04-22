import { z } from "zod";
import { moyskladPost } from "../client.js";

export const createSupplySchema = z.object({
  organization_href: z.string().describe("Meta href of the organization (receiver). Get from /entity/organization"),
  agent_href: z.string().describe("Meta href of the counterparty (supplier). Get from /entity/counterparty"),
  store_href: z.string().optional().describe("Meta href of the warehouse. Get from /entity/store"),
  description: z.string().optional().describe("Supply description/comment"),
  incoming_number: z.string().optional().describe("Incoming document number from supplier"),
  incoming_date: z.string().optional().describe("Incoming document date (ISO 8601)"),
  positions: z.array(z.object({
    assortment_href: z.string().describe("Meta href of the product"),
    quantity: z.number().min(1).describe("Quantity"),
    price_rubles: z.number().optional().describe("Price per unit in RUBLES (converted to kopecks internally)"),
  })).min(1).describe("Supply line items"),
});

export async function handleCreateSupply(params: z.infer<typeof createSupplySchema>): Promise<string> {
  const body: Record<string, unknown> = {
    organization: { meta: { href: params.organization_href, type: "organization", mediaType: "application/json" } },
    agent: { meta: { href: params.agent_href, type: "counterparty", mediaType: "application/json" } },
    positions: params.positions.map((p) => {
      const pos: Record<string, unknown> = {
        quantity: p.quantity,
        assortment: { meta: { href: p.assortment_href, type: "product", mediaType: "application/json" } },
      };
      if (p.price_rubles !== undefined) pos.price = Math.round(p.price_rubles * 100);
      return pos;
    }),
  };
  if (params.description) body.description = params.description;
  if (params.incoming_number) body.incomingNumber = params.incoming_number;
  if (params.incoming_date) body.incomingDate = params.incoming_date;
  if (params.store_href) {
    body.store = { meta: { href: params.store_href, type: "store", mediaType: "application/json" } };
  }
  const result = await moyskladPost("/entity/supply", body);
  const s = result as Record<string, unknown>;
  return JSON.stringify({
    id: s.id, name: s.name, moment: s.moment,
    sum_rubles: typeof s.sum === "number" ? (s.sum as number) / 100 : null,
    created: s.created,
  }, null, 2);
}
