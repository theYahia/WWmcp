#!/usr/bin/env node

/**
 * @theyahia/kavenegar-mcp — MCP server for Kavenegar (Iran SMS gateway)
 *
 * 8 tools: send_sms, send_bulk_sms, get_delivery_status, get_account_info,
 * lookup, send_otp, get_balance, list_outbox.
 * Auth: KAVENEGAR_API_KEY (passed in the URL path).
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import { sendSmsSchema, handleSendSms } from "./tools/send-sms.js";
import { sendBulkSmsSchema, handleSendBulkSms } from "./tools/send-bulk-sms.js";
import { getDeliveryStatusSchema, handleGetDeliveryStatus } from "./tools/get-delivery-status.js";
import { getAccountInfoSchema, handleGetAccountInfo } from "./tools/get-account-info.js";
import { lookupSchema, handleLookup } from "./tools/lookup.js";
import { sendOtpSchema, handleSendOtp } from "./tools/send-otp.js";
import { getBalanceSchema, handleGetBalance } from "./tools/get-balance.js";
import { listOutboxSchema, handleListOutbox } from "./tools/list-outbox.js";

const NAME = "kavenegar-mcp";
const VERSION = "1.0.1";
const logger = createLogger(NAME);

function text(value: string) {
  return { content: [{ type: "text" as const, text: value }] };
}

function createServer(): McpServer {
  const server = new McpServer({ name: NAME, version: VERSION });

  server.tool("send_sms", "Send an SMS message via Kavenegar.", sendSmsSchema.shape,
    withErrorHandling(async (params) => text(await handleSendSms(params))));

  server.tool("send_bulk_sms", "Send SMS to multiple recipients.", sendBulkSmsSchema.shape,
    withErrorHandling(async (params) => text(await handleSendBulkSms(params))));

  server.tool("get_delivery_status", "Check SMS delivery status.", getDeliveryStatusSchema.shape,
    withErrorHandling(async (params) => text(await handleGetDeliveryStatus(params))));

  server.tool("get_account_info", "Get Kavenegar account information.", getAccountInfoSchema.shape,
    withErrorHandling(async (params) => text(await handleGetAccountInfo(params))));

  server.tool("lookup", "Send template-based SMS (verify/OTP).", lookupSchema.shape,
    withErrorHandling(async (params) => text(await handleLookup(params))));

  server.tool("send_otp", "Send OTP code using a template.", sendOtpSchema.shape,
    withErrorHandling(async (params) => text(await handleSendOtp(params))));

  server.tool("get_balance", "Get account balance and credit info.", getBalanceSchema.shape,
    withErrorHandling(async (params) => text(await handleGetBalance(params))));

  server.tool("list_outbox", "List sent messages in date range.", listOutboxSchema.shape,
    withErrorHandling(async (params) => text(await handleListOutbox(params))));

  return server;
}

runServer(createServer, {
  name: NAME,
  version: VERSION,
  toolCount: 8,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
