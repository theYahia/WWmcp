#!/usr/bin/env node

/**
 * @theyahia/alfa-bank-mcp — MCP server for Alfa-Bank Business (Alfa API).
 *
 * 8 tools: list_accounts, get_account_balance, get_account_statement,
 * create_payment_order, get_payment_status, list_counterparties,
 * get_exchange_rates, get_salary_registry.
 *
 * ⚠️ See README "Disclaimer & endpoint verification status": endpoint paths are
 * aligned to public docs but not all verified 1:1, and production access needs
 * mTLS + GOST request signing. The server does not reach the live contour
 * without real certificates and a bank contract.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT) — both from
 * @theyahia/mcp-core. The Alfa API client stays our own (see client.ts): OIDC
 * scope, GOST signature header and the no-repeat rule for payments.
 *
 * Security:
 *   - stdout reserved for JSON-RPC — all logs go to stderr via the core logger
 *   - credentials never logged or placed in error responses
 *   - input validation via Zod on every tool call
 *   - tool output and errors pass through core withErrorHandling (sanitization)
 *   - hard timeout + bounded retries on read requests; payments are never repeated
 */

import { createRequire } from "node:module";
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer } from "@theyahia/mcp-core";

import { AlfaBankClient } from "./client.js";
import { configureMtlsFromEnv } from "./auth/mtls.js";
import { registerAccountTools } from "./tools/accounts.js";
import { registerPaymentTools } from "./tools/payments.js";
import { registerReferenceTools } from "./tools/references.js";

// Single source of truth for the version (resolved at runtime from package.json).
const requireFromHere = createRequire(import.meta.url);
const { version } = requireFromHere("../package.json") as { version: string };

const TOOL_COUNT = 8;

const logger = createLogger("alfa-bank-mcp");

const INSTRUCTIONS =
  "Tools for Alfa-Bank Business (Alfa API): accounts, balances, statements, payments, " +
  "counterparties, exchange rates and payroll registries. All tools are read-only EXCEPT " +
  "create_payment_order, which moves real money and is annotated as destructive — confirm with " +
  "the user before calling it. Auth is OAuth2/OIDC (client credentials); production also requires " +
  "mTLS and a PKCS#7 GOST signature on payments, so payment submission errors out until a real " +
  "signer is injected. Endpoint paths follow the public Alfa API docs; some are unverified (see README).";

/** Builds the Alfa API client from environment configuration. */
function buildClient(): AlfaBankClient {
  return new AlfaBankClient({
    clientId: process.env.ALFA_CLIENT_ID ?? "",
    clientSecret: process.env.ALFA_CLIENT_SECRET ?? "",
    baseUrl: process.env.ALFA_BASE_URL || "https://baas.alfabank.ru",
    scope: process.env.ALFA_SCOPE,
    timeoutMs: process.env.ALFA_TIMEOUT_MS ? Number(process.env.ALFA_TIMEOUT_MS) : undefined,
  });
}

// ponytail: one client per process — HTTP mode builds a server per session, and
// the sessions share one OIDC token cache instead of re-authenticating each.
let client: AlfaBankClient | undefined;
function getClient(): AlfaBankClient {
  client ??= buildClient();
  return client;
}

/** Creates a fully configured MCP server (no transport attached). */
export function createMcpServer(): McpServer {
  const server = new McpServer({ name: "alfa-bank-mcp", version }, { instructions: INSTRUCTIONS });
  const alfa = getClient();

  registerAccountTools(server, alfa); // list_accounts, get_account_balance, get_account_statement
  registerPaymentTools(server, alfa); // create_payment_order, get_payment_status
  registerReferenceTools(server, alfa); // list_counterparties, get_exchange_rates, get_salary_registry

  return server;
}

async function main(): Promise<void> {
  // Environment validation — fail fast with a clear message.
  if (!process.env.ALFA_CLIENT_ID || !process.env.ALFA_CLIENT_SECRET) {
    logger.error(
      "ALFA_CLIENT_ID and ALFA_CLIENT_SECRET are required. Get OAuth credentials at " +
        "https://developers.alfabank.ru/ and add them to your MCP client env configuration.",
    );
    process.exit(1);
  }

  const mtls = configureMtlsFromEnv();
  logger.info(
    mtls
      ? "mTLS configured from ALFA_TLS_* env."
      : "Running without mTLS (demo mode — cannot reach the live Alfa API).",
  );

  await runServer(createMcpServer, { name: "alfa-bank-mcp", version, toolCount: TOOL_COUNT, logger });
}

/** True when this file is the process entry point (not imported by tests). */
function isMainModule(): boolean {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]);
  } catch {
    return false;
  }
}

if (isMainModule()) {
  main().catch((err) => {
    logger.error("Fatal error", { error: err instanceof Error ? err.message : String(err) });
    process.exit(1);
  });
}
