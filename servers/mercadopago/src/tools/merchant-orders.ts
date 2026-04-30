import { z } from "zod";
import { mpGet } from "../client.js";

// ── search_merchant_orders ──

export const searchMerchantOrdersSchema = z.object({
  external_reference: z.string().optional().describe("Filter by your internal reference"),
  preference_id: z.string().optional().describe("Filter by preference ID"),
  status: z.string().optional().describe("Filter by order status"),
  limit: z.number().int().min(1).max(100).default(30).describe("Results per page"),
  offset: z.number().int().min(0).default(0).describe("Pagination offset"),
});

export async function handleSearchMerchantOrders(
  params: z.infer<typeof searchMerchantOrdersSchema>,
): Promise<string> {
  const query: Record<string, string> = {
    limit: String(params.limit),
    offset: String(params.offset),
  };
  if (params.external_reference) query.external_reference = params.external_reference;
  if (params.preference_id) query.preference_id = params.preference_id;
  if (params.status) query.status = params.status;

  const result = await mpGet("/merchant_orders/search", query);
  return JSON.stringify(result, null, 2);
}

// ── get_merchant_order ──

export const getMerchantOrderSchema = z.object({
  merchant_order_id: z.string().describe("Merchant order ID"),
});

export async function handleGetMerchantOrder(
  params: z.infer<typeof getMerchantOrderSchema>,
): Promise<string> {
  const result = await mpGet(`/merchant_orders/${params.merchant_order_id}`);
  return JSON.stringify(result, null, 2);
}
