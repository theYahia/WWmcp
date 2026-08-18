import { z } from "zod";
import { moyskladPost } from "../client.js";
import { formatDocument, meta, position } from "../lib.js";
import type { ToolDef } from "../types.js";

export const createSupplySchema = z.object({
  organization_href: z.string().describe("Meta href of the organization (receiver). Get from list_organizations"),
  agent_href: z.string().describe("Meta href of the counterparty (supplier). Get from get_counterparties"),
  store_href: z.string().optional().describe("Meta href of the warehouse. Get from list_stores"),
  description: z.string().optional().describe("Supply description/comment"),
  incoming_number: z.string().optional().describe("Incoming document number from supplier"),
  incoming_date: z.string().optional().describe("Incoming document date (ISO 8601)"),
  positions: z
    .array(
      z.object({
        assortment_href: z.string().describe("Meta href of the product/variant/service/bundle"),
        quantity: z.number().min(1).describe("Quantity"),
        price_rubles: z.number().optional().describe("Price per unit in RUBLES (converted to kopecks internally)"),
      }),
    )
    .min(1)
    .describe("Supply line items"),
});

export async function handleCreateSupply(params: z.infer<typeof createSupplySchema>): Promise<string> {
  const body: Record<string, unknown> = {
    organization: meta(params.organization_href, "organization"),
    agent: meta(params.agent_href, "counterparty"),
    positions: params.positions.map(position),
  };
  if (params.description) body.description = params.description;
  if (params.incoming_number) body.incomingNumber = params.incoming_number;
  if (params.incoming_date) body.incomingDate = params.incoming_date;
  if (params.store_href) body.store = meta(params.store_href, "store");
  const result = await moyskladPost("/entity/supply", body);
  return formatDocument(result);
}

export const tools: ToolDef[] = [
  {
    name: "create_supply",
    description: "Create an incoming supply (purchase receipt). Prices in RUBLES.",
    schema: createSupplySchema,
    handler: handleCreateSupply,
  },
];
