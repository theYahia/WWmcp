#!/usr/bin/env node

/**
 * @theyahia/jazzcash-mcp — MCP server for JazzCash (Pakistan)
 *
 * 5 tools: create_payment, create_mobile_account_payment, create_voucher,
 * check_payment_status, refund_payment.
 * Auth: JAZZCASH_MERCHANT_ID + JAZZCASH_PASSWORD + JAZZCASH_INTEGRITY_SALT (HMAC-SHA256 secure hash).
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runServer, withErrorHandling } from "@theyahia/mcp-core";
import { getClient, logger } from "./client.js";
import { getPackageVersion, SUCCESS_CODE } from "./config.js";
import type { JazzCashResponse } from "./types.js";

import { createPaymentSchema, handleCreatePayment } from "./tools/create-payment.js";
import { createMobileAccountPaymentSchema, handleCreateMobileAccountPayment } from "./tools/create-mobile-account-payment.js";
import { createVoucherSchema, handleCreateVoucher } from "./tools/create-voucher.js";
import { checkPaymentStatusSchema, handleCheckPaymentStatus } from "./tools/check-payment-status.js";
import { refundPaymentSchema, handleRefundPayment } from "./tools/refund-payment.js";

const NAME = "jazzcash-mcp";
const VERSION = getPackageVersion();
const TOOL_COUNT = 5;

/**
 * Tool execution wrapper:
 *  - catches throws (missing creds, HTTP/timeout, response-hash mismatch) → isError result
 *    with the JazzCash-specific text (core's generic "retry the request" advice is wrong for
 *    non-idempotent money-moving calls);
 *  - for write operations, flags a non-success JazzCash pp_ResponseCode as an error so the
 *    model never reports a declined/failed payment as a success.
 */
async function runTool(handler: () => Promise<JazzCashResponse>, readOnly: boolean) {
  try {
    const result = await handler();
    const code = result.pp_ResponseCode;
    const isError = !readOnly && code !== undefined && code !== SUCCESS_CODE;
    const body = JSON.stringify(result, null, 2);
    const text = isError
      ? `JazzCash returned ${code}: ${result.pp_ResponseMessage ?? "operation failed"}\n${body}`
      : body;
    return { content: [{ type: "text" as const, text }], isError };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { content: [{ type: "text" as const, text: `JazzCash error: ${msg}` }], isError: true };
  }
}

/** runTool + core withErrorHandling (output sanitization and truncation). */
function tool<T>(handler: (params: T) => Promise<JazzCashResponse>, readOnly: boolean) {
  return withErrorHandling((params: T) => runTool(() => handler(params), readOnly));
}

function createServer(): McpServer {
  const server = new McpServer({ name: NAME, version: VERSION });

  server.registerTool(
    "create_payment",
    {
      description:
        "Create a JazzCash Mobile Wallet (MWALLET) payment. amount is in PKR rupees (converted to paisa). txn_ref is auto-generated when omitted. Returns the JazzCash pp_ResponseCode/pp_ResponseMessage. Money-moving and non-idempotent — do not retry blindly.",
      inputSchema: createPaymentSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    tool(handleCreatePayment, false),
  );

  server.registerTool(
    "create_mobile_account_payment",
    {
      description:
        "Create a CNIC-enabled JazzCash Mobile Account payment (MWALLET with the last 6 CNIC digits). amount is in PKR rupees. Returns pp_ResponseCode/pp_ResponseMessage. Money-moving and non-idempotent.",
      inputSchema: createMobileAccountPaymentSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    tool(handleCreateMobileAccountPayment, false),
  );

  server.registerTool(
    "create_voucher",
    {
      description:
        "Create a JazzCash Over-The-Counter (OTC) voucher payment. amount is in PKR rupees. The response carries a voucher number the customer redeems offline at a JazzCash outlet (there is no redeem API). Money-moving and non-idempotent.",
      inputSchema: createVoucherSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    tool(handleCreateVoucher, false),
  );

  server.registerTool(
    "check_payment_status",
    {
      description:
        "Look up the status of a JazzCash transaction by its reference (PaymentInquiry/Inquire). Read-only; returns the current pp_ResponseCode/pp_ResponseMessage for the queried transaction.",
      inputSchema: checkPaymentStatusSchema.shape,
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    tool(handleCheckPaymentStatus, true),
  );

  server.registerTool(
    "refund_payment",
    {
      description:
        "Refund a JazzCash transaction (authorize/Refund). amount is in PKR rupees. IRREVERSIBLE — moves money back to the customer. Per JazzCash, refunds apply to card transactions; verify applicability for wallet/OTC.",
      inputSchema: refundPaymentSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    tool(handleRefundPayment, false),
  );

  return server;
}

async function main() {
  // Fail fast on misconfiguration: instantiate the client (validates env credentials) before connecting,
  // so a misconfigured server errors out clearly instead of advertising tools that fail on first use.
  getClient();
  await runServer(createServer, { name: NAME, version: VERSION, toolCount: TOOL_COUNT, logger });
}

main().catch((error) => {
  logger.error("Fatal error", { error: error instanceof Error ? error.message : String(error) });
  process.exit(1);
});
