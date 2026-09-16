#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, startStdio, withErrorHandling } from "@theyahia/mcp-core";
import { runAuthCommand } from "./auth/authCommand.js";
import { OAuthAuthProvider } from "./auth/provider.js";
import { TochkaBankClient } from "./client.js";
import { redact } from "./redact.js";
import { type ToolDef, wrapTool } from "./tools/_shared.js";
import { getAccountBalanceTool, getStatementTool, listAccountsTool } from "./tools/accounts.js";
import { getCompanyInfoTool, listCustomersTool } from "./tools/customers.js";
import { createPaymentTool, getPaymentStatusTool } from "./tools/payments.js";

const NAME = "tochka-bank-mcp";
const logger = createLogger(NAME);

const TOOLS: ToolDef[] = [
  listAccountsTool,
  getAccountBalanceTool,
  getStatementTool,
  createPaymentTool,
  getPaymentStatusTool,
  listCustomersTool,
  getCompanyInfoTool,
];

function packageVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
      version?: string;
    };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

function printHelp(): void {
  console.log(`tochka-bank-mcp v${packageVersion()}

Usage:
  tochka-bank-mcp            Start the MCP server (stdio)
  tochka-bank-mcp auth       Run the one-time OAuth authorization
  tochka-bank-mcp --version  Print version
  tochka-bank-mcp --help     Show this help

Required env: TOCHKA_CLIENT_ID, TOCHKA_CLIENT_SECRET
Run \`tochka-bank-mcp auth --help\` for authorization details.`);
}

async function main(): Promise<void> {
  const cmd = process.argv[2];
  if (cmd === "auth") {
    await runAuthCommand(process.argv.slice(3));
    return;
  }
  if (cmd === "--version" || cmd === "-v") {
    console.log(packageVersion());
    return;
  }
  if (cmd === "--help" || cmd === "-h") {
    printHelp();
    return;
  }

  const clientId = process.env.TOCHKA_CLIENT_ID;
  const clientSecret = process.env.TOCHKA_CLIENT_SECRET;
  const baseUrl = process.env.TOCHKA_BASE_URL || "https://enter.tochka.com/uapi";

  if (!clientId || !clientSecret) {
    logger.error("Missing TOCHKA_CLIENT_ID or TOCHKA_CLIENT_SECRET environment variables");
    process.exit(1);
  }

  const auth = new OAuthAuthProvider({ clientId, clientSecret, baseUrl });
  const client = new TochkaBankClient({ auth, baseUrl });
  const version = packageVersion();

  const server = new McpServer({ name: NAME, version });

  for (const tool of TOOLS) {
    server.registerTool(
      tool.name,
      tool.config,
      // wrapTool redacts PII/secrets in errors; core withErrorHandling adds
      // prompt-injection filtering and truncation on top.
      // biome-ignore lint/suspicious/noExplicitAny: bridging our ToolDef registry to the SDK's per-tool generic callback type.
      withErrorHandling(wrapTool(client, tool)) as any,
    );
  }

  // ponytail: stdio only, as in the satellite. Core runServer would also enable
  // HTTP on HTTP_PORT — no bearer auth, all interfaces — not acceptable for a bank.
  await startStdio(server, { name: NAME, version, toolCount: TOOLS.length, logger });
}

main().catch((err) => {
  logger.error("Fatal error", {
    error: redact(err instanceof Error ? err.message : String(err)),
  });
  process.exit(1);
});
