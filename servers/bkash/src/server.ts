/**
 * bKash MCP server factory.
 *
 * 8 tools for the bKash Tokenized Checkout API.
 * All tools defined inline (no separate tools/* files — small surface).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
import { bkashPost } from "./client.js";

export const logger = createLogger("bkash-mcp");

export const TOOL_COUNT = 8;

export function createServer(): McpServer {
  const server = new McpServer({
    name: "bkash-mcp",
    version: "1.0.0",
  });

  server.tool(
    "create_payment",
    "Create a bKash tokenized payment. Returns a payment ID + redirect URL for the customer's bKash app. Required: amount (BDT), invoice number, intent (sale or authorization), payerReference (customer phone or ID).",
    {
      amount: z.string().describe("Amount in BDT as string (e.g. '500.00')"),
      currency: z.literal("BDT").default("BDT").describe("Always BDT"),
      intent: z.enum(["sale", "authorization"]).default("sale").describe("Payment intent"),
      merchantInvoiceNumber: z.string().describe("Unique invoice number from your system"),
      payerReference: z.string().describe("Customer phone number or internal customer ID"),
      callbackURL: z.string().url().describe("Where bKash redirects the customer after the payment popup completes"),
      merchantAssociationInfo: z.string().optional().describe("Optional merchant metadata"),
    },
    withErrorHandling(async (params) => {
      const body = {
        mode: "0011",
        payerReference: params.payerReference,
        callbackURL: params.callbackURL,
        amount: params.amount,
        currency: params.currency,
        intent: params.intent,
        merchantInvoiceNumber: params.merchantInvoiceNumber,
        ...(params.merchantAssociationInfo
          ? { merchantAssociationInfo: params.merchantAssociationInfo }
          : {}),
      };
      const result = await bkashPost("/tokenized/checkout/create", body);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "execute_payment",
    "Finalize (execute) a bKash payment after the customer completes the popup flow. Required: paymentID returned by create_payment.",
    {
      paymentID: z.string().describe("Payment ID returned by create_payment"),
    },
    withErrorHandling(async (params) => {
      const result = await bkashPost("/tokenized/checkout/execute", { paymentID: params.paymentID });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "query_payment",
    "Query the status of a bKash payment by paymentID — returns transactionStatus, amount, currency, payerReference.",
    {
      paymentID: z.string().describe("Payment ID to look up"),
    },
    withErrorHandling(async (params) => {
      const result = await bkashPost("/tokenized/checkout/payment/status", { paymentID: params.paymentID });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "search_transaction",
    "Search a bKash transaction by trxID (transaction reference) — returns full transaction details.",
    {
      trxID: z.string().describe("Transaction reference ID"),
    },
    withErrorHandling(async (params) => {
      const result = await bkashPost("/tokenized/checkout/general/searchTransaction", { trxID: params.trxID });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "refund_payment",
    "Refund a completed bKash payment (full or partial). Requires paymentID, trxID, amount, and a unique reason/sku reference.",
    {
      paymentID: z.string().describe("Payment ID to refund"),
      trxID: z.string().describe("Transaction reference of the original payment"),
      amount: z.string().describe("Refund amount in BDT (e.g. '100.00') — can be partial"),
      sku: z.string().describe("Unique SKU/reason for the refund (your tracking ID)"),
      reason: z.string().optional().describe("Human-readable reason"),
    },
    withErrorHandling(async (params) => {
      const result = await bkashPost("/tokenized/checkout/payment/refund", {
        paymentID: params.paymentID,
        trxID: params.trxID,
        amount: params.amount,
        sku: params.sku,
        ...(params.reason ? { reason: params.reason } : {}),
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "query_refund",
    "Query the status of a previously initiated bKash refund.",
    {
      paymentID: z.string().describe("Payment ID"),
      trxID: z.string().describe("Original transaction reference"),
      sku: z.string().describe("SKU used in refund_payment"),
    },
    withErrorHandling(async (params) => {
      const result = await bkashPost("/tokenized/checkout/payment/refund", {
        paymentID: params.paymentID,
        trxID: params.trxID,
        sku: params.sku,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "agreement_create",
    "Create a tokenized agreement (recurring billing) with a bKash customer. Returns a payment ID + redirect URL for customer consent. Use this for subscription-style billing.",
    {
      payerReference: z.string().describe("Customer phone number or internal ID"),
      callbackURL: z.string().url().describe("Where bKash redirects after customer consents"),
      merchantAssociationInfo: z.string().optional().describe("Optional metadata"),
    },
    withErrorHandling(async (params) => {
      const result = await bkashPost("/tokenized/checkout/create", {
        mode: "0000",
        payerReference: params.payerReference,
        callbackURL: params.callbackURL,
        ...(params.merchantAssociationInfo
          ? { merchantAssociationInfo: params.merchantAssociationInfo }
          : {}),
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "agreement_query",
    "Query an existing bKash agreement by agreementID — returns agreement status and payerReference.",
    {
      agreementID: z.string().describe("Agreement ID"),
    },
    withErrorHandling(async (params) => {
      const result = await bkashPost("/tokenized/checkout/agreement/status", { agreementID: params.agreementID });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  return server;
}
