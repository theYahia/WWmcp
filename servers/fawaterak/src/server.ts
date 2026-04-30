/**
 * Fawaterak MCP server factory (Egyptian payment aggregator).
 *
 * 8 tools defined inline. Endpoint paths verified via Brave sweep against
 * fawaterak-api.readme.io and staging.fawaterk.com curl samples.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
import { fawaterakGet, fawaterakPost } from "./client.js";

export const logger = createLogger("fawaterak-mcp");

export const TOOL_COUNT = 8;

const customerSchema = z.object({
  first_name: z.string().describe("Customer first name"),
  last_name: z.string().describe("Customer last name"),
  email: z.string().email().describe("Customer email"),
  phone: z.string().describe("Customer phone (Egyptian format, e.g. 01XXXXXXXXX)"),
  address: z.string().optional().describe("Customer address"),
});

const cartItemSchema = z.object({
  name: z.string().describe("Item name"),
  price: z.string().describe("Item unit price as string (e.g. '50.00')"),
  quantity: z.string().describe("Quantity as string (e.g. '1')"),
});

export function createServer(): McpServer {
  const server = new McpServer({
    name: "fawaterak-mcp",
    version: "1.0.0",
  });

  server.tool(
    "create_invoice_link",
    "Create a Fawaterak invoice link (cart-style) — returns a hosted checkout URL the customer opens to pay via any enabled method (Fawry, cards, wallets, Meeza). Currency typically EGP.",
    {
      cartTotal: z.string().describe("Total cart amount as string (e.g. '50.00')"),
      currency: z.string().default("EGP").describe("Currency code"),
      customer: customerSchema,
      cartItems: z.array(cartItemSchema).min(1).describe("Items in the cart"),
      redirectionUrls: z
        .object({
          successUrl: z.string().url().describe("Customer redirected here on success"),
          failUrl: z.string().url().describe("Customer redirected here on failure"),
          pendingUrl: z.string().url().optional().describe("Customer redirected here on pending"),
        })
        .describe("Redirect URLs after the customer leaves the hosted checkout"),
    },
    withErrorHandling(async (params) => {
      const result = await fawaterakPost("/createInvoiceLink", params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "send_payment",
    "Initiate a direct Fawaterak payment for a specific payment method (paymentMethodId from get_payment_methods) — returns either a redirect URL or method-specific instructions (e.g. Fawry reference number).",
    {
      payment_method_id: z.number().int().describe("Payment method ID from get_payment_methods"),
      cartTotal: z.string().describe("Total amount as string"),
      currency: z.string().default("EGP").describe("Currency code"),
      customer: customerSchema,
      cartItems: z.array(cartItemSchema).min(1).describe("Items"),
      redirectionUrls: z
        .object({
          successUrl: z.string().url(),
          failUrl: z.string().url(),
          pendingUrl: z.string().url().optional(),
        })
        .describe("Redirect URLs"),
    },
    withErrorHandling(async (params) => {
      const body = {
        payment_method_id: params.payment_method_id,
        cartTotal: params.cartTotal,
        currency: params.currency,
        customer: params.customer,
        cartItems: params.cartItems,
        redirectionUrls: params.redirectionUrls,
      };
      const result = await fawaterakPost("/invoiceInitPay", body);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "get_payment_methods",
    "List all payment methods enabled on the Fawaterak account — returns id, name, key (e.g. fawry, visa, meeza), commission rate.",
    {},
    withErrorHandling(async () => {
      const result = await fawaterakGet("/getPaymentMethods");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "get_invoice_data",
    "Get full invoice data by invoice_id — status, amount, payment_method, transaction_id, customer info.",
    {
      invoice_id: z.string().describe("Fawaterak invoice ID"),
    },
    withErrorHandling(async (params) => {
      const result = await fawaterakGet("/getInvoiceData", { invoice_id: params.invoice_id });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "list_invoices",
    "List Fawaterak invoices with pagination + optional status filter (paid, unpaid, expired).",
    {
      page: z.number().int().min(1).default(1).describe("Page number"),
      per_page: z.number().int().min(1).max(100).default(50).describe("Items per page"),
      status: z.enum(["paid", "unpaid", "expired", "cancelled"]).optional().describe("Filter by invoice status"),
    },
    withErrorHandling(async (params) => {
      const query: Record<string, string> = {
        page: String(params.page),
        per_page: String(params.per_page),
      };
      if (params.status) query.status = params.status;
      const result = await fawaterakGet("/getInvoicesList", query);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "cancel_invoice",
    "Cancel a Fawaterak invoice that has not yet been paid.",
    {
      invoice_id: z.string().describe("Invoice ID to cancel"),
    },
    withErrorHandling(async (params) => {
      const result = await fawaterakPost("/cancelInvoice", { invoice_id: params.invoice_id });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "refund_payment",
    "Refund a paid Fawaterak invoice (full or partial). Refund availability depends on payment method — Fawry refunds may take 1–3 business days.",
    {
      invoice_id: z.string().describe("Invoice ID to refund"),
      amount: z.string().optional().describe("Partial refund amount as string (omit for full refund)"),
      reason: z.string().optional().describe("Refund reason"),
    },
    withErrorHandling(async (params) => {
      const body: Record<string, unknown> = { invoice_id: params.invoice_id };
      if (params.amount) body.amount = params.amount;
      if (params.reason) body.reason = params.reason;
      const result = await fawaterakPost("/refund", body);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "get_balance",
    "Get current Fawaterak merchant balance — settled amount, pending amount, currency.",
    {},
    withErrorHandling(async () => {
      const result = await fawaterakGet("/getBalance");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  return server;
}
