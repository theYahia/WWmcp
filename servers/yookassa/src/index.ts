#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer, type IncomingMessage, type Server } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { z } from "zod";
import {
  createPaymentSchema, handleCreatePayment,
  getPaymentSchema, handleGetPayment,
  capturePaymentSchema, handleCapturePayment,
  cancelPaymentSchema, handleCancelPayment,
  listPaymentsSchema, handleListPayments,
  savePaymentMethodSchema, handleSavePaymentMethod,
  createRecurringPaymentSchema, handleCreateRecurringPayment,
  createSbpPaymentSchema, handleCreateSbpPayment,
  createSplitPaymentSchema, handleCreateSplitPayment,
} from "./tools/payments.js";
import {
  createRefundSchema, handleCreateRefund,
  getRefundSchema, handleGetRefund,
  listRefundsSchema, handleListRefunds,
} from "./tools/refunds.js";
import {
  createReceiptSchema, handleCreateReceipt,
  listReceiptsSchema, handleListReceipts,
} from "./tools/receipts.js";
import { handleGetBalance } from "./tools/balance.js";
import {
  createPayoutSchema, handleCreatePayout,
  getPayoutSchema, handleGetPayout,
} from "./tools/payouts.js";
import {
  createWebhookSchema, handleCreateWebhook,
  handleListWebhooks,
  deleteWebhookSchema, handleDeleteWebhook,
} from "./tools/webhooks.js";

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { version: string };

const SERVER_INSTRUCTIONS =
  "This server wraps the YooKassa payment API. Tools that move REAL MONEY " +
  "(create_payment, create_payout, create_refund, create_recurring_payment, " +
  "save_payment_method, capture_payment) are irreversible — confirm the amount, currency, " +
  "and recipient with the user before calling them, and prefer test-shop credentials while " +
  "developing (check get_shop_info: test=true). Read tools (get_*/list_*/get_shop_info) are " +
  "safe to call freely.";

// --- Annotation presets (hints to clients; see MCP ToolAnnotations) ---
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const;
function writeMoney(idempotent = false) {
  return { readOnlyHint: false, destructiveHint: true, idempotentHint: idempotent, openWorldHint: true } as const;
}

// --- Structured output for single-object (payment/refund/payout) results ---
const objectResultSchema = {
  id: z.string().optional(),
  status: z.string().optional(),
  paid: z.boolean().optional(),
  amount: z.object({ value: z.string(), currency: z.string() }).partial().optional(),
  confirmation_url: z.string().optional(),
};
function toStructured(text: string): Record<string, unknown> {
  try {
    const r = JSON.parse(text) as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of ["id", "status", "paid", "amount"]) {
      if (r[k] !== undefined) out[k] = r[k];
    }
    const confirmation = r.confirmation as { confirmation_url?: string } | undefined;
    if (confirmation?.confirmation_url !== undefined) out.confirmation_url = confirmation.confirmation_url;
    return out;
  } catch {
    return {};
  }
}
/** Wrap a string-returning handler into an MCP result with both text and structuredContent. */
function objectResult(text: string) {
  return { content: [{ type: "text" as const, text }], structuredContent: toStructured(text) };
}

export function createMcpServer(): McpServer {
  const server = new McpServer(
    { name: "yookassa-mcp", version: pkg.version },
    { instructions: SERVER_INSTRUCTIONS },
  );

  // === Payments (9) ===

  server.registerTool("create_payment", {
    title: "Create payment",
    description: "Create a payment in YooKassa. Returns a confirmation URL. Supports one-step and two-step payments, receipts, and metadata. MOVES REAL MONEY (the payer is charged) — irreversible.",
    inputSchema: createPaymentSchema.shape,
    outputSchema: objectResultSchema,
    annotations: writeMoney(),
  }, async (params) => objectResult(await handleCreatePayment(params)));

  server.registerTool("get_payment", {
    title: "Get payment",
    description: "Get payment details by ID. Returns status, amount, payment method, confirmation URL, and metadata.",
    inputSchema: getPaymentSchema.shape,
    outputSchema: objectResultSchema,
    annotations: READ_ONLY,
  }, async (params) => objectResult(await handleGetPayment(params)));

  server.registerTool("capture_payment", {
    title: "Capture payment",
    description: "Confirm a two-step payment (capture held funds). Optionally capture a partial amount. MOVES REAL MONEY — irreversible.",
    inputSchema: capturePaymentSchema.shape,
    outputSchema: objectResultSchema,
    annotations: writeMoney(true),
  }, async (params) => objectResult(await handleCapturePayment(params)));

  server.registerTool("cancel_payment", {
    title: "Cancel payment",
    description: "Cancel a payment (pending or waiting_for_capture). Releases any held funds.",
    inputSchema: cancelPaymentSchema.shape,
    outputSchema: objectResultSchema,
    annotations: writeMoney(true),
  }, async (params) => objectResult(await handleCancelPayment(params)));

  server.registerTool("list_payments", {
    title: "List payments",
    description: "List payments with filters by status, date range, and pagination cursor.",
    inputSchema: listPaymentsSchema.shape,
    annotations: READ_ONLY,
  }, async (params) => ({ content: [{ type: "text", text: await handleListPayments(params) }] }));

  server.registerTool("save_payment_method", {
    title: "Save payment method",
    description: "Save a payment method for recurring charges. Creates a small real payment to bind the card/wallet (charged, then refundable). MOVES REAL MONEY — irreversible.",
    inputSchema: savePaymentMethodSchema.shape,
    outputSchema: objectResultSchema,
    annotations: writeMoney(),
  }, async (params) => objectResult(await handleSavePaymentMethod(params)));

  server.registerTool("create_recurring_payment", {
    title: "Create recurring payment",
    description: "Charge a saved payment method. Charges the card immediately WITHOUT any user interaction. MOVES REAL MONEY — irreversible.",
    inputSchema: createRecurringPaymentSchema.shape,
    outputSchema: objectResultSchema,
    annotations: writeMoney(),
  }, async (params) => objectResult(await handleCreateRecurringPayment(params)));

  server.registerTool("create_sbp_payment", {
    title: "Create SBP payment",
    description: "Create a payment via SBP (Russian fast payment system). Returns a confirmation URL / deep-link for the payer's banking app. MOVES REAL MONEY — irreversible.",
    inputSchema: createSbpPaymentSchema.shape,
    outputSchema: objectResultSchema,
    annotations: writeMoney(),
  }, async (params) => objectResult(await handleCreateSbpPayment(params)));

  server.registerTool("create_split_payment", {
    title: "Create split payment",
    description: "Create a split payment for marketplaces (distributes funds among partner shops). Requires the YooKassa-for-platforms product. MOVES REAL MONEY — irreversible.",
    inputSchema: createSplitPaymentSchema.shape,
    outputSchema: objectResultSchema,
    annotations: writeMoney(),
  }, async (params) => objectResult(await handleCreateSplitPayment(params)));

  // === Refunds (3) ===

  server.registerTool("create_refund", {
    title: "Create refund",
    description: "Refund a payment (full or partial) by payment_id and amount. MOVES REAL MONEY (funds returned to the payer) — irreversible.",
    inputSchema: createRefundSchema.shape,
    outputSchema: objectResultSchema,
    annotations: writeMoney(),
  }, async (params) => objectResult(await handleCreateRefund(params)));

  server.registerTool("get_refund", {
    title: "Get refund",
    description: "Get refund details by ID. Returns status, amount, and payment reference.",
    inputSchema: getRefundSchema.shape,
    outputSchema: objectResultSchema,
    annotations: READ_ONLY,
  }, async (params) => objectResult(await handleGetRefund(params)));

  server.registerTool("list_refunds", {
    title: "List refunds",
    description: "List refunds with optional filter by payment_id.",
    inputSchema: listRefundsSchema.shape,
    annotations: READ_ONLY,
  }, async (params) => ({ content: [{ type: "text", text: await handleListRefunds(params) }] }));

  // === Receipts (2) ===

  server.registerTool("create_receipt", {
    title: "Create receipt",
    description: "Create a standalone fiscal receipt (54-FZ). Supports payment and refund receipts with items, VAT codes, and customer contacts.",
    inputSchema: createReceiptSchema.shape,
    annotations: writeMoney(),
  }, async (params) => ({ content: [{ type: "text", text: await handleCreateReceipt(params) }] }));

  server.registerTool("list_receipts", {
    title: "List receipts",
    description: "List receipts with filters by payment_id or refund_id.",
    inputSchema: listReceiptsSchema.shape,
    annotations: READ_ONLY,
  }, async (params) => ({ content: [{ type: "text", text: await handleListReceipts(params) }] }));

  // === Payouts (2) ===

  server.registerTool("create_payout", {
    title: "Create payout",
    description: "Create a payout to a bank card, YooMoney wallet, or SBP. Requires the separately-activated YooKassa Payouts product with its own credentials (see README/SECURITY). Asynchronous — the response may be 'pending'; poll get_payout for the final status. MOVES REAL MONEY — irreversible.",
    inputSchema: createPayoutSchema.shape,
    outputSchema: objectResultSchema,
    annotations: writeMoney(),
  }, async (params) => {
    const text = await handleCreatePayout(params);
    const content: { type: "text"; text: string }[] = [{ type: "text", text }];
    const structuredContent = toStructured(text);
    if (structuredContent.status === "pending") {
      content.push({ type: "text", text: "Note: this payout is pending (asynchronous). Poll get_payout(payout_id) or await a webhook for the final status before treating it as complete." });
    }
    return { content, structuredContent };
  });

  server.registerTool("get_payout", {
    title: "Get payout",
    description: "Get payout details by ID. Returns status, amount, and destination.",
    inputSchema: getPayoutSchema.shape,
    outputSchema: objectResultSchema,
    annotations: READ_ONLY,
  }, async (params) => objectResult(await handleGetPayout(params)));

  // === Webhooks (3) ===

  server.registerTool("create_webhook", {
    title: "Create webhook",
    description: "Register a webhook URL for YooKassa events (payment.succeeded, refund.succeeded, etc.).",
    inputSchema: createWebhookSchema.shape,
    annotations: writeMoney(),
  }, async (params) => ({ content: [{ type: "text", text: await handleCreateWebhook(params) }] }));

  server.registerTool("list_webhooks", {
    title: "List webhooks",
    description: "List all registered webhooks for this shop.",
    inputSchema: {},
    annotations: READ_ONLY,
  }, async () => ({ content: [{ type: "text", text: await handleListWebhooks() }] }));

  server.registerTool("delete_webhook", {
    title: "Delete webhook",
    description: "Delete a webhook by ID. Stops sending notifications for that webhook.",
    inputSchema: deleteWebhookSchema.shape,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
  }, async (params) => ({ content: [{ type: "text", text: await handleDeleteWebhook(params) }] }));

  // === Account (1) ===

  server.registerTool("get_shop_info", {
    title: "Get shop info",
    description: "Get shop info: ID, status, test mode, fiscalization settings. (YooKassa has no balance endpoint; this returns shop configuration, not a monetary balance.)",
    inputSchema: {},
    annotations: READ_ONLY,
  }, async () => ({ content: [{ type: "text", text: await handleGetBalance() }] }));

  return server;
}

/** Count the registered tools by introspecting a probe server (keeps /health honest). */
export async function countRegisteredTools(): Promise<number> {
  const probe = createMcpServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "probe", version: "0.0.0" });
  await Promise.all([probe.connect(serverTransport), client.connect(clientTransport)]);
  const { tools } = await client.listTools();
  await client.close();
  await probe.close();
  return tools.length;
}

/** Constant-time Bearer-token check. */
function isAuthorized(req: IncomingMessage, expectedToken: string): boolean {
  const header = req.headers["authorization"];
  if (typeof header !== "string" || !header.startsWith("Bearer ")) return false;
  const provided = Buffer.from(header.slice("Bearer ".length));
  const expected = Buffer.from(expectedToken);
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

export interface HttpServerConfig {
  /** Shared secret required as a Bearer token on /mcp. */
  authToken: string;
  /** Host:port values accepted in the Host header (DNS-rebinding protection). */
  allowedHosts: string[];
  /** Browser Origins allowed for CORS (empty = reject all browser origins). */
  allowedOrigins: string[];
  /** Tool count reported by /health. */
  toolCount: number;
}

/**
 * Build the HTTP server (without listening) so it can be unit-tested.
 *
 * Security posture for a money-moving server:
 * - /mcp requires a Bearer token (constant-time compare) before anything else.
 * - Stateless transport: a fresh McpServer + transport per request, closed when
 *   the response ends (no connect()-per-request leak on a shared server).
 * - DNS-rebinding protection via allowedHosts/allowedOrigins on the transport.
 * - CORS never uses "*"; an Origin is echoed only if explicitly allow-listed.
 */
export function createHttpServer(config: HttpServerConfig): Server {
  return createServer(async (req, res) => {
    const origin = req.headers["origin"];
    if (typeof origin === "string" && config.allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization, Mcp-Session-Id");
    }

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", server: "yookassa-mcp", tools: config.toolCount }));
      return;
    }

    if (req.url === "/mcp") {
      if (req.method !== "POST") {
        // Stateless endpoint: no GET (SSE) / DELETE (session) support.
        res.writeHead(405, { "Content-Type": "application/json", "Allow": "POST" });
        res.end(JSON.stringify({ error: "Method Not Allowed (stateless MCP endpoint accepts POST only)" }));
        return;
      }
      if (!isAuthorized(req, config.authToken)) {
        res.writeHead(401, { "Content-Type": "application/json", "WWW-Authenticate": "Bearer" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }

      const requestServer = createMcpServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableDnsRebindingProtection: true,
        allowedHosts: config.allowedHosts,
        allowedOrigins: config.allowedOrigins,
      });
      res.on("close", () => {
        transport.close();
        requestServer.close();
      });
      await requestServer.connect(transport);
      await transport.handleRequest(req, res);
      return;
    }

    res.writeHead(404);
    res.end("Not Found");
  });
}

async function startHttpServer(port: number): Promise<void> {
  const authToken = process.env.MCP_AUTH_TOKEN;
  if (!authToken) {
    throw new Error(
      "HTTP transport requires MCP_AUTH_TOKEN — a strong shared secret sent as a Bearer token on /mcp. " +
      "Refusing to expose money-moving tools without authentication. Set MCP_AUTH_TOKEN and retry."
    );
  }

  const host = process.env.HTTP_HOST ?? "127.0.0.1";
  const allowedHosts = (process.env.MCP_ALLOWED_HOSTS ?? `127.0.0.1:${port},localhost:${port}`)
    .split(",").map((s) => s.trim()).filter(Boolean);
  const allowedOrigins = (process.env.MCP_ALLOWED_ORIGINS ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const toolCount = await countRegisteredTools();

  const httpServer = createHttpServer({ authToken, allowedHosts, allowedOrigins, toolCount });

  httpServer.listen(port, host, () => {
    console.error(`[yookassa-mcp] HTTP server on ${host}:${port} (${toolCount} tools)`);
    console.error(`[yookassa-mcp] MCP: http://${host}:${port}/mcp (Bearer auth required)`);
    console.error(`[yookassa-mcp] Health: http://${host}:${port}/health`);
  });
}

async function main() {
  const httpPort = process.argv.includes("--http")
    ? parseInt(process.env.HTTP_PORT ?? "3000", 10)
    : process.env.HTTP_PORT
      ? parseInt(process.env.HTTP_PORT, 10)
      : null;

  if (httpPort) {
    await startHttpServer(httpPort);
  } else {
    const server = createMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[yookassa-mcp] Server started (stdio). Production-grade YooKassa MCP.");
  }
}

main().catch((error) => {
  console.error("[yookassa-mcp] Startup error:", error);
  process.exit(1);
});
