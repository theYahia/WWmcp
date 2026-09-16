import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// NOTE: this is an EVENT POLL, not a list of orders. iFood expects one GET every
// ~30s per token; it returns new events (PLACED/CONFIRMED/CANCELLED/...). Each
// returned event MUST be acknowledged via `acknowledge_events`, or it is
// redelivered on every subsequent poll. Returns 200 with events, or 204 (no events).
export const list_ordersSchema = z.object({
  types: z.string().optional().describe("Comma-separated event types to filter (e.g. 'PLC,CFM'). Avoid combining with `groups`."),
  groups: z.string().optional().describe("Comma-separated event groups (e.g. 'ORDER_STATUS'). Groups already include their types."),
  categories: z.string().optional().describe("Comma-separated order categories to filter."),
  merchant_ids: z.string().optional().describe("Comma-separated merchant IDs for the `x-polling-merchants` header (max 100). Use when one token serves multiple stores."),
});

export async function handleListOrders(params: z.infer<typeof list_ordersSchema>): Promise<string> {
  const headers = params.merchant_ids ? { "x-polling-merchants": params.merchant_ids } : undefined;
  const result = await getClient().request("GET", "/order/v1.0/events:polling", undefined, {
    query: { types: params.types, groups: params.groups, categories: params.categories },
    headers,
  });
  return formatResult(result, "No new events (204).");
}
