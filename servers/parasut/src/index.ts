#!/usr/bin/env node

/**
 * @theyahia/parasut-mcp — MCP server for the Paraşüt API v4 (Turkey)
 *
 * Auth: OAuth 2.0 password grant — PARASUT_CLIENT_ID, PARASUT_CLIENT_SECRET,
 * PARASUT_USERNAME, PARASUT_PASSWORD (+ optional PARASUT_COMPANY_ID).
 *
 * Transports:
 *   - stdio (default)
 *   - Streamable HTTP — `--http [port]` or HTTP_PORT (port 3000 default);
 *     CORS is opt-in via PARASUT_HTTP_CORS_ORIGIN.
 */

import { startHttp, startStdio } from "@theyahia/mcp-core";
import { createServer, logger, TOOL_COUNT, VERSION } from "./server.js";

async function main(): Promise<void> {
  const config = { name: "parasut-mcp", version: VERSION, toolCount: TOOL_COUNT, logger };
  const httpFlag = process.argv.indexOf("--http");

  if (httpFlag === -1 && !process.env.HTTP_PORT) {
    await startStdio(createServer(), config);
    return;
  }

  // ponytail: core's runServer ignores `--http <port>` and has no CORS knob;
  // both are documented in the README, so they are wired here by hand.
  const port = parseInt(process.env.HTTP_PORT || process.argv[httpFlag + 1] || "", 10) || 3000;
  const cors = process.env.PARASUT_HTTP_CORS_ORIGIN;
  await startHttp(createServer, { ...config, port, corsOrigins: cors ? [cors] : [] });
}

main().catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
