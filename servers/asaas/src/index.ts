#!/usr/bin/env node

/**
 * @theyahia/asaas-mcp — MCP server for the Asaas payments API (Brazil)
 *
 * 9 tools: create_payment, get_payment, list_payments, create_pix_qr,
 * get_pix_status, create_customer, list_customers, create_subscription,
 * refund_payment.
 * Auth: ASAAS_API_KEY.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import { create_paymentSchema, handleCreatePayment } from "./tools/create-payment.js";
import { get_paymentSchema, handleGetPayment } from "./tools/get-payment.js";
import { list_paymentsSchema, handleListPayments } from "./tools/list-payments.js";
import { create_pix_qrSchema, handleCreatePixQr } from "./tools/create-pix-qr.js";
import { get_pix_statusSchema, handleGetPixStatus } from "./tools/get-pix-status.js";
import { create_customerSchema, handleCreateCustomer } from "./tools/create-customer.js";
import { list_customersSchema, handleListCustomers } from "./tools/list-customers.js";
import { create_subscriptionSchema, handleCreateSubscription } from "./tools/create-subscription.js";
import { refund_paymentSchema, handleRefundPayment } from "./tools/refund-payment.js";

const VERSION = "1.0.1";
const TOOL_COUNT = 9;
const logger = createLogger("asaas-mcp");

function createServer(): McpServer {
  const server = new McpServer({ name: "asaas-mcp", version: VERSION });

  server.tool("create_payment", "Create a payment/billing", create_paymentSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleCreatePayment(params) }] })));
  server.tool("get_payment", "Get an Asaas payment (charge) by its ID", get_paymentSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleGetPayment(params) }] })));
  server.tool("list_payments", "List Asaas payments with pagination and optional status filter", list_paymentsSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleListPayments(params) }] })));
  server.tool("create_pix_qr", "Generate Pix QR code", create_pix_qrSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleCreatePixQr(params) }] })));
  server.tool("get_pix_status", "Get Pix payment status", get_pix_statusSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleGetPixStatus(params) }] })));
  server.tool("create_customer", "Create a customer in Asaas (name, CPF/CNPJ, email)", create_customerSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleCreateCustomer(params) }] })));
  server.tool("list_customers", "List Asaas customers with pagination", list_customersSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleListCustomers(params) }] })));
  server.tool("create_subscription", "Create a subscription", create_subscriptionSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleCreateSubscription(params) }] })));
  server.tool("refund_payment", "Refund an Asaas payment, fully or partially (value)", refund_paymentSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleRefundPayment(params) }] })));

  return server;
}

runServer(createServer, {
  name: "asaas-mcp",
  version: VERSION,
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
