/**
 * PayMongo MCP server factory.
 * Split from index.ts so tests can import without triggering runServer.
 */

import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger } from "@theyahia/mcp-core";

import { tool, type ToolDescriptor } from "./lib/tool.js";

import { createPaymentIntentTool } from "./tools/create-payment-intent.js";
import { getPaymentIntentTool } from "./tools/get-payment-intent.js";
import { createSourceTool } from "./tools/create-source.js";
import { getSourceTool } from "./tools/get-source.js";
import { createPaymentTool } from "./tools/create-payment.js";
import { listPaymentsTool } from "./tools/list-payments.js";
import { createRefundTool } from "./tools/create-refund.js";
import { createCheckoutTool } from "./tools/create-checkout.js";
import { getCheckoutTool } from "./tools/get-checkout.js";
import { linksDescriptors } from "./tools/links.js";
import { webhooksDescriptors } from "./tools/webhooks.js";
import { paymentMethodsDescriptors } from "./tools/payment-methods.js";
import { customersDescriptors } from "./tools/customers.js";
import { refundsDescriptors } from "./tools/refunds.js";

export const logger = createLogger("paymongo-mcp");

const FALLBACK_VERSION = "1.1.0";

/** Read the package version at runtime (dist/server.js → ../package.json). */
function getVersion(): string {
  try {
    const require = createRequire(import.meta.url);
    const pkg = require("../package.json") as { version?: string };
    return pkg.version ?? FALLBACK_VERSION;
  } catch {
    return FALLBACK_VERSION;
  }
}

export const VERSION = getVersion();

const tools: ToolDescriptor[] = [
  createPaymentIntentTool,
  getPaymentIntentTool,
  createSourceTool,
  getSourceTool,
  createPaymentTool,
  listPaymentsTool,
  createRefundTool,
  createCheckoutTool,
  getCheckoutTool,
  ...linksDescriptors,
  ...webhooksDescriptors,
  ...paymentMethodsDescriptors,
  ...customersDescriptors,
  ...refundsDescriptors,
];

export const TOOL_COUNT = tools.length;

export function createServer(): McpServer {
  const server = new McpServer({ name: "paymongo-mcp", version: VERSION });

  for (const t of tools) {
    server.registerTool(
      t.name,
      {
        title: t.title,
        description: t.description,
        inputSchema: t.inputSchema,
        annotations: t.annotations,
      },
      tool(t.handler),
    );
  }

  return server;
}
