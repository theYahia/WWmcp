#!/usr/bin/env node

/**
 * @theyahia/cloudpayments-mcp — MCP server for CloudPayments API
 *
 * 6 tools: charge, auth, confirm, void_payment, get_transaction, refund.
 * Auth: Basic (publicId:apiSecret).
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import {
  chargeSchema, handleCharge,
  authSchema, handleAuth,
  confirmSchema, handleConfirm,
  voidSchema, handleVoid,
  getTransactionSchema, handleGetTransaction,
} from "./tools/payments.js";
import { refundSchema, handleRefund } from "./tools/refunds.js";

const logger = createLogger("cloudpayments-mcp");

function createServer(): McpServer {
  const server = new McpServer({
    name: "cloudpayments-mcp",
    version: "1.2.0",
  });

  server.tool(
    "charge",
    "One-step payment (charge) via CloudPayments. Pass card cryptogram and amount to immediately capture funds. Requires IP address and supports optional invoice ID, description, and receipt email.",
    chargeSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCharge(params) }],
    })),
  );

  server.tool(
    "auth",
    "Two-step payment (authorization/hold) via CloudPayments. Funds are blocked but not captured until confirmed. Use confirm to capture or void_payment to release. Supports same parameters as charge.",
    authSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleAuth(params) }],
    })),
  );

  server.tool(
    "confirm",
    "Confirm an authorized payment in CloudPayments to capture the held funds. You can confirm a partial amount less than the original authorization. Requires the transaction ID from the auth step.",
    confirmSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleConfirm(params) }],
    })),
  );

  server.tool(
    "void_payment",
    "Void an authorized payment in CloudPayments to release the held funds back to the cardholder. Only works for authorized (not yet confirmed) transactions. Use refund for confirmed payments.",
    voidSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleVoid(params) }],
    })),
  );

  server.tool(
    "get_transaction",
    "Find a transaction by ID in CloudPayments. Returns full transaction details including status, amount, card info, and timestamps. Useful for checking payment status or debugging.",
    getTransactionSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetTransaction(params) }],
    })),
  );

  server.tool(
    "refund",
    "Refund a completed payment in CloudPayments, either fully or partially. Specify the transaction ID and refund amount. Partial refunds can be issued multiple times up to the original amount.",
    refundSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleRefund(params) }],
    })),
  );

  return server;
}

runServer(createServer, {
  name: "cloudpayments-mcp",
  version: "1.2.0",
  toolCount: 6,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
