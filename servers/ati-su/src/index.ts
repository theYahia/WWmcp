#!/usr/bin/env node

/**
 * @theyahia/ati-su-mcp — MCP server for the ATI.su freight exchange API.
 *
 * Tools (read): get_firm, search_firms, get_load, list_my_loads,
 *   search_loads_byboards, list_my_trucks, get_truck, list_body_types,
 *   list_cargo_types, resolve_city, get_distance (paid).
 * Tools (write): create_load (gated).
 *
 * Auth: static token (ATI_TOKEN) OR OAuth2 (ATI_CLIENT_ID/SECRET/REFRESH_TOKEN).
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT) — both from
 * @theyahia/mcp-core. The ATI.su HTTP client and OAuth2 token provider stay our
 * own (see client.ts / auth.ts): refresh_token grant, single-flight refresh,
 * refresh-on-401, Retry-After.
 *
 * Security:
 *   - stdout reserved for JSON-RPC — all logs go to stderr via the core logger
 *   - Bearer token never logged or placed in error responses
 *   - Input validation via Zod on every tool; write/paid tools behind env flags
 *   - tool output and errors pass through core withErrorHandling (sanitization)
 */

import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer } from "@theyahia/mcp-core";

import { authMode, AUTH_HELP } from "./auth.js";
import { config } from "./config.js";
import { registerFirmTools } from "./tools/firms.js";
import { registerLoadTools } from "./tools/loads.js";
import { registerTruckTools } from "./tools/trucks.js";
import { registerDictionaryTools } from "./tools/dictionaries.js";
import { registerDistanceTools } from "./tools/distance.js";

const TOOL_COUNT = 12;

const logger = createLogger("ati-su-mcp");

/** Reads the package version at runtime (avoids an ESM JSON import that fights rootDir). */
export function packageVersion(): string {
  try {
    const pkgUrl = new URL("../package.json", import.meta.url);
    const pkg = JSON.parse(readFileSync(fileURLToPath(pkgUrl), "utf8")) as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

export const SERVER_INSTRUCTIONS = [
  "This server wraps the ATI.su freight exchange (Russian logistics) API.",
  "Cities are referenced by numeric ids — use resolve_city to turn names like 'Москва' into ids",
  "before calling get_distance. Weights are in tons, volumes in m³, money in the firm's currency",
  "(usually RUB). Firm reputation is `score` (stars; a negative value means bad/red stars).",
  "Truck tools (list_my_trucks/get_truck) only see YOUR OWN fleet — ATI has no public truck search,",
  "and there is no general public load search (only search_loads_byboards over your own boards).",
  "create_load publishes a REAL, public load on a live marketplace: it is disabled unless",
  "ATI_ALLOW_WRITES=1 and previews via dry_run by default. get_distance is a PAID feature",
  "(enable with ATI_ENABLE_DISTANCE=1).",
].join(" ");

/** Builds a fully-wired MCP server without connecting a transport (used by tests). */
export function buildServer(): McpServer {
  const server = new McpServer(
    { name: "ati-su-mcp", version: packageVersion() },
    { instructions: SERVER_INSTRUCTIONS },
  );

  registerFirmTools(server); // get_firm, search_firms
  registerLoadTools(server); // get_load, list_my_loads, search_loads_byboards, create_load
  registerTruckTools(server); // list_my_trucks, get_truck
  registerDictionaryTools(server); // list_body_types, list_cargo_types, resolve_city
  registerDistanceTools(server); // get_distance (paid)

  return server;
}

async function main(): Promise<void> {
  if (authMode() === "none") {
    logger.error(`No ATI.su credentials. ${AUTH_HELP}`);
    process.exit(1);
  }

  logger.info("Configuration", {
    auth: authMode(),
    writes: config.allowWrites,
    distance: config.enableDistance,
    sandbox: config.sandbox,
  });

  await runServer(buildServer, {
    name: "ati-su-mcp",
    version: packageVersion(),
    toolCount: TOOL_COUNT,
    logger,
  });
}

/** True only when this file is the process entrypoint (so importing it in tests is side-effect-free). */
function isEntrypoint(): boolean {
  try {
    return (
      !!process.argv[1] &&
      realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
    );
  } catch {
    return false;
  }
}

if (isEntrypoint()) {
  main().catch((err) => {
    logger.error("Fatal error", { error: err instanceof Error ? err.message : String(err) });
    process.exit(1);
  });
}
