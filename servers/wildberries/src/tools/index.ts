/**
 * Aggregated tool registry — re-exports every module's definitions and routes
 * dispatch to the right module handler.
 *
 * Backward compatibility: the parent `src/tools.ts` re-exports
 * `toolDefinitions`, `handleTool`, and `ToolName` from here unchanged, so
 * existing imports continue to work after the v1.1.0 refactor.
 */
import type { WBClient } from "../client.js";

import { productsToolDefinitions, handleProductsTool } from "./products.js";
import { stockToolDefinitions, handleStockTool } from "./stock.js";
import { ordersToolDefinitions, handleOrdersTool } from "./orders.js";
import {
  sellerAccountToolDefinitions,
  handleSellerAccountTool,
} from "./seller-account.js";
import { analyticsToolDefinitions, handleAnalyticsTool } from "./analytics.js";
import { webhooksToolDefinitions, handleWebhooksTool } from "./webhooks.js";

export const toolDefinitions = {
  ...productsToolDefinitions,
  ...stockToolDefinitions,
  ...ordersToolDefinitions,
  ...sellerAccountToolDefinitions,
  ...analyticsToolDefinitions,
  ...webhooksToolDefinitions,
} as const;

export type ToolName = keyof typeof toolDefinitions;

export async function handleTool(
  client: WBClient,
  name: ToolName,
  args: Record<string, unknown>,
): Promise<unknown> {
  if (name in productsToolDefinitions) {
    return handleProductsTool(
      client,
      name as keyof typeof productsToolDefinitions,
      args,
    );
  }
  if (name in stockToolDefinitions) {
    return handleStockTool(client, name as keyof typeof stockToolDefinitions, args);
  }
  if (name in ordersToolDefinitions) {
    return handleOrdersTool(client, name as keyof typeof ordersToolDefinitions, args);
  }
  if (name in sellerAccountToolDefinitions) {
    return handleSellerAccountTool(
      client,
      name as keyof typeof sellerAccountToolDefinitions,
      args,
    );
  }
  if (name in analyticsToolDefinitions) {
    return handleAnalyticsTool(
      client,
      name as keyof typeof analyticsToolDefinitions,
      args,
    );
  }
  if (name in webhooksToolDefinitions) {
    return handleWebhooksTool(
      client,
      name as keyof typeof webhooksToolDefinitions,
      args,
    );
  }
  throw new Error(`Unknown tool: ${String(name)}`);
}
