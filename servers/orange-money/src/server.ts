/**
 * Orange Money WebPay MCP server factory.
 *
 * 8 tools for the Orange Money WebPay API. Endpoint paths mirror the
 * developer.orange.com SDK quickstart samples (Brave-verified).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
import { omGet, omPost } from "./client.js";

export const logger = createLogger("orange-money-mcp");

export const TOOL_COUNT = 8;

const SUPPORTED_COUNTRIES = ["sn", "ci", "ml", "cm", "bf", "td", "mg", "ne", "gn", "lr", "sl", "cd"] as const;

export function createServer(): McpServer {
  const server = new McpServer({
    name: "orange-money-mcp",
    version: "1.0.0",
  });

  server.tool(
    "create_webpayment",
    "Create an Orange Money WebPay session — returns a redirect URL where the customer authenticates with their Orange Money PIN to confirm the payment. Required: amount (in local currency XOF/XAF), order_id (unique), URL trio.",
    {
      amount: z.number().positive().describe("Amount in local currency units (XOF for West Africa, XAF for Central Africa)"),
      currency: z.string().describe("Currency code (XOF / XAF / OUV)"),
      order_id: z.string().describe("Your unique order identifier"),
      return_url: z.string().url().describe("Where customer is redirected on successful payment"),
      cancel_url: z.string().url().describe("Where customer is redirected if they cancel"),
      notif_url: z.string().url().describe("Webhook URL — Orange Money POSTs final payment status here"),
      reference: z.string().optional().describe("Reference shown to the customer on the Orange Money screen"),
      lang: z.enum(["fr", "en"]).default("fr").describe("UI language for the payment screen"),
    },
    withErrorHandling(async (params) => {
      const merchantKey = process.env["ORANGE_MONEY_MERCHANT_KEY"];
      if (!merchantKey) {
        throw new Error("ORANGE_MONEY_MERCHANT_KEY is required (get it from developer.orange.com)");
      }
      const body = {
        merchant_key: merchantKey,
        currency: params.currency,
        order_id: params.order_id,
        amount: params.amount,
        return_url: params.return_url,
        cancel_url: params.cancel_url,
        notif_url: params.notif_url,
        ...(params.reference ? { reference: params.reference } : {}),
        lang: params.lang,
      };
      const result = await omPost("/webpayment", body);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "get_payment_status",
    "Get the status of an Orange Money WebPay session by order_id + amount + pay_token (returned by create_webpayment).",
    {
      order_id: z.string().describe("The order_id used in create_webpayment"),
      amount: z.number().positive().describe("The amount used in create_webpayment"),
      pay_token: z.string().describe("Pay token returned by create_webpayment"),
    },
    withErrorHandling(async (params) => {
      const result = await omPost("/transactionstatus", params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "cashin",
    "Push money TO a customer's Orange Money wallet (B2B disbursement). Requires the customer's MSISDN (phone number).",
    {
      partner_id: z.string().describe("Your partner ID from Orange Money business portal"),
      partner_name: z.string().describe("Your business display name"),
      partner_msisdn: z.string().describe("Your business MSISDN (phone)"),
      customer_msisdn: z.string().describe("Customer phone number to credit (E.164 with country code)"),
      amount: z.string().describe("Amount as string in local currency"),
      reference: z.string().describe("Your unique transaction reference"),
      pin: z.string().optional().describe("Partner PIN (if required by your country setup)"),
    },
    withErrorHandling(async (params) => {
      const result = await omPost("/cashin", params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "cashout",
    "Pull money FROM a customer's Orange Money wallet (B2B collection). Customer must have pre-authorized the merchant.",
    {
      partner_id: z.string().describe("Your partner ID"),
      partner_name: z.string().describe("Your business display name"),
      partner_msisdn: z.string().describe("Your business MSISDN"),
      customer_msisdn: z.string().describe("Customer phone number to debit (E.164)"),
      amount: z.string().describe("Amount as string"),
      reference: z.string().describe("Unique transaction reference"),
      pin: z.string().optional().describe("Partner PIN if required"),
    },
    withErrorHandling(async (params) => {
      const result = await omPost("/cashout", params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "transfer",
    "Transfer money between two Orange Money wallets via the merchant API.",
    {
      from_msisdn: z.string().describe("Sender MSISDN"),
      to_msisdn: z.string().describe("Recipient MSISDN"),
      amount: z.string().describe("Amount as string"),
      reference: z.string().describe("Unique transfer reference"),
      pin: z.string().optional().describe("Sender PIN if required"),
    },
    withErrorHandling(async (params) => {
      const result = await omPost("/transfer", params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "get_balance",
    "Get the current balance of your merchant Orange Money wallet for the configured country.",
    {},
    withErrorHandling(async () => {
      const result = await omGet("/balance");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "list_supported_countries",
    "Return the list of supported Orange Money WebPay countries this server can route to (read from a static map; switch country via ORANGE_MONEY_COUNTRY env var).",
    {},
    withErrorHandling(async () => {
      const result = {
        configured_country: process.env["ORANGE_MONEY_COUNTRY"] ?? null,
        supported_country_codes: SUPPORTED_COUNTRIES,
        notes:
          "ISO country codes (lowercase). To switch country: set ORANGE_MONEY_COUNTRY env var and restart the server. Currency is XOF for West African UEMOA countries (sn, ci, ml, bf, ne, tg, bj), XAF for Central African CEMAC countries (cm, td, cf, cg, gq, ga).",
      };
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "validate_webhook",
    "Validate an incoming Orange Money webhook notification — checks that the order_id + pay_token + amount match a previously created webpayment by querying transactionstatus.",
    {
      order_id: z.string().describe("order_id from the webhook payload"),
      amount: z.number().positive().describe("amount from the webhook payload"),
      pay_token: z.string().describe("pay_token from the webhook payload"),
    },
    withErrorHandling(async (params) => {
      const result = await omPost("/transactionstatus", {
        order_id: params.order_id,
        amount: params.amount,
        pay_token: params.pay_token,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  return server;
}
