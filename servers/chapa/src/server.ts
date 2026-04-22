/**
 * Chapa MCP server factory (Ethiopia payment gateway).
 *
 * 8 tools defined inline, calling chapaGet/chapaPost from client.ts.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
import { chapaGet, chapaPost } from "./client.js";

export const logger = createLogger("chapa-mcp");

export const TOOL_COUNT = 8;

export function createServer(): McpServer {
  const server = new McpServer({
    name: "chapa-mcp",
    version: "1.0.0",
  });

  server.tool(
    "initialize_transaction",
    "Initialize a Chapa payment. Returns a checkout URL to redirect the customer to. Required: amount (ETB), currency (default ETB), tx_ref (your unique reference), customer email + names.",
    {
      amount: z.string().describe("Amount in ETB as string (e.g. '100' or '100.50')"),
      currency: z.string().default("ETB").describe("Currency code (typically ETB)"),
      email: z.string().email().describe("Customer email"),
      first_name: z.string().describe("Customer first name"),
      last_name: z.string().describe("Customer last name"),
      phone_number: z.string().optional().describe("Customer phone (optional)"),
      tx_ref: z.string().describe("Your unique transaction reference (no duplicates allowed)"),
      callback_url: z.string().url().optional().describe("Webhook URL for status updates"),
      return_url: z.string().url().optional().describe("Where customer is redirected after checkout"),
      customization_title: z.string().optional().describe("Title shown on the checkout page"),
      customization_description: z.string().optional().describe("Description shown on the checkout page"),
    },
    withErrorHandling(async (params) => {
      const body: Record<string, unknown> = {
        amount: params.amount,
        currency: params.currency,
        email: params.email,
        first_name: params.first_name,
        last_name: params.last_name,
        tx_ref: params.tx_ref,
      };
      if (params.phone_number) body.phone_number = params.phone_number;
      if (params.callback_url) body.callback_url = params.callback_url;
      if (params.return_url) body.return_url = params.return_url;
      if (params.customization_title || params.customization_description) {
        body.customization = {
          ...(params.customization_title ? { title: params.customization_title } : {}),
          ...(params.customization_description ? { description: params.customization_description } : {}),
        };
      }
      const result = await chapaPost("/transaction/initialize", body);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "verify_transaction",
    "Verify a Chapa transaction by tx_ref — returns status, amount, charged amount, customer info, payment method.",
    {
      tx_ref: z.string().describe("Transaction reference used in initialize_transaction"),
    },
    withErrorHandling(async (params) => {
      const result = await chapaGet(`/transaction/verify/${params.tx_ref}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "list_banks",
    "List banks supported by Chapa for transfers (currency = ETB or USD). Use this before transfer to look up bank_code.",
    {
      currency: z.enum(["ETB", "USD"]).default("ETB").describe("Currency to list banks for"),
    },
    withErrorHandling(async (params) => {
      const result = await chapaGet("/banks", { currency: params.currency });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "transfer",
    "Initiate a Chapa transfer (payout) to a bank account. Required: account_number, account_name, amount, currency, reference, bank_code (from list_banks).",
    {
      account_name: z.string().describe("Recipient account holder name"),
      account_number: z.string().describe("Recipient bank account number"),
      amount: z.string().describe("Transfer amount as string (e.g. '500')"),
      currency: z.string().default("ETB").describe("Currency code"),
      reference: z.string().describe("Your unique transfer reference"),
      bank_code: z.string().describe("Bank code from list_banks"),
      beneficiary_name: z.string().optional().describe("Beneficiary name (some banks require)"),
    },
    withErrorHandling(async (params) => {
      const body: Record<string, unknown> = {
        account_name: params.account_name,
        account_number: params.account_number,
        amount: params.amount,
        currency: params.currency,
        reference: params.reference,
        bank_code: params.bank_code,
      };
      if (params.beneficiary_name) body.beneficiary_name = params.beneficiary_name;
      const result = await chapaPost("/transfers", body);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "verify_transfer",
    "Verify the status of a Chapa transfer by reference.",
    {
      reference: z.string().describe("Transfer reference"),
    },
    withErrorHandling(async (params) => {
      const result = await chapaGet(`/transfers/verify/${params.reference}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "list_transfers",
    "List recent Chapa transfers with pagination.",
    {
      page: z.number().int().min(1).default(1).describe("Page number"),
      per_page: z.number().int().min(1).max(100).default(50).describe("Items per page"),
    },
    withErrorHandling(async (params) => {
      const result = await chapaGet("/transfers", {
        page: String(params.page),
        per_page: String(params.per_page),
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "list_transactions",
    "List recent Chapa transactions with pagination + optional filter.",
    {
      page: z.number().int().min(1).default(1).describe("Page number"),
      per_page: z.number().int().min(1).max(100).default(50).describe("Items per page"),
      status: z.enum(["pending", "success", "failed"]).optional().describe("Filter by transaction status"),
    },
    withErrorHandling(async (params) => {
      const query: Record<string, string> = {
        page: String(params.page),
        per_page: String(params.per_page),
      };
      if (params.status) query.status = params.status;
      const result = await chapaGet("/transactions", query);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "get_balance",
    "Get current Chapa account wallet balance (ETB and any other supported currencies).",
    {},
    withErrorHandling(async () => {
      const result = await chapaGet("/balances");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  return server;
}
