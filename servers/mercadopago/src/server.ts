/**
 * MercadoPago MCP server factory.
 * Split from index.ts so tests can import without triggering runServer.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
import {
  createPaymentSchema, handleCreatePayment,
  getPaymentSchema, handleGetPayment,
  searchPaymentsSchema, handleSearchPayments,
  refundPaymentSchema, handleRefundPayment,
  getPaymentMethodsSchema, handleGetPaymentMethods,
} from "./tools/payments.js";
import {
  createPreferenceSchema, handleCreatePreference,
  getPreferenceSchema, handleGetPreference,
  updatePreferenceSchema, handleUpdatePreference,
} from "./tools/preferences.js";
import {
  searchMerchantOrdersSchema, handleSearchMerchantOrders,
  getMerchantOrderSchema, handleGetMerchantOrder,
} from "./tools/merchant-orders.js";

export const logger = createLogger("mercadopago-mcp");

export const TOOL_COUNT = 10;

export function createServer(): McpServer {
  const server = new McpServer({
    name: "mercadopago-mcp",
    version: "1.0.0",
  });

  server.tool(
    "create_payment",
    "Create a MercadoPago payment (charge a customer). Required: amount, description, payment_method_id, payer_email. For card payments, also pass `token` from the frontend SDK and optional `installments`. Works across AR, BR, MX, UY, CL, CO, PE.",
    createPaymentSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreatePayment(params) }],
    })),
  );

  server.tool(
    "get_payment",
    "Get full details of a MercadoPago payment by ID — status, amount, payer, refunds, fee details.",
    getPaymentSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetPayment(params) }],
    })),
  );

  server.tool(
    "search_payments",
    "Search MercadoPago payments by external_reference, status, or date range. Supports pagination.",
    searchPaymentsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSearchPayments(params) }],
    })),
  );

  server.tool(
    "refund_payment",
    "Refund a MercadoPago payment — full refund (omit `amount`) or partial refund (specify `amount` in account currency).",
    refundPaymentSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleRefundPayment(params) }],
    })),
  );

  server.tool(
    "get_payment_methods",
    "List all MercadoPago payment methods enabled on the account (cards, wallets, vouchers like Rapipago, PIX, OXXO).",
    getPaymentMethodsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetPaymentMethods(params) }],
    })),
  );

  server.tool(
    "create_preference",
    "Create a MercadoPago Checkout preference (a hosted checkout session). Returns `init_point` URL to send the customer to. Use this for Checkout Pro or Bricks integrations.",
    createPreferenceSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreatePreference(params) }],
    })),
  );

  server.tool(
    "get_preference",
    "Get a MercadoPago Checkout preference by ID — items, totals, status, redirect URLs.",
    getPreferenceSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetPreference(params) }],
    })),
  );

  server.tool(
    "update_preference",
    "Update a MercadoPago Checkout preference (items, redirect URLs, expiration). Pass the fields to change in `patch`.",
    updatePreferenceSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleUpdatePreference(params) }],
    })),
  );

  server.tool(
    "search_merchant_orders",
    "Search merchant orders (orchestrators of payments + shipments). Filter by external_reference, preference_id, or status.",
    searchMerchantOrdersSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSearchMerchantOrders(params) }],
    })),
  );

  server.tool(
    "get_merchant_order",
    "Get a merchant order by ID — preference, payments, shipments, totals.",
    getMerchantOrderSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetMerchantOrder(params) }],
    })),
  );

  return server;
}
