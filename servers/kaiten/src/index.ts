#!/usr/bin/env node

/**
 * @theyahia/kaiten-mcp — MCP server for the Kaiten API (Russia)
 *
 * 63 tools: spaces, boards, columns, lanes, cards, comments, members, tags,
 * checklists, child cards, external links, blockers, card types, sprints,
 * custom properties, users.
 * Auth: KAITEN_TOKEN + KAITEN_DOMAIN (or KAITEN_BASE_URL for self-hosted).
 *
 * Transports: stdio (default), Streamable HTTP (`--http [port]` or HTTP_PORT).
 */

import { startHttp, startStdio } from "@theyahia/mcp-core";
import { logger } from "./client.js";
import { createServer, TOOL_COUNT } from "./server.js";
import { VERSION } from "./version.js";

// Не runServer ядра: он не берёт порт из `--http <port>` и не знает про
// KAITEN_HTTP_CORS_ORIGIN, а оба описаны в README опубликованного пакета.
async function main(): Promise<void> {
  const config = { name: "kaiten-mcp", version: VERSION, toolCount: TOOL_COUNT, logger };
  const args = process.argv.slice(2);
  const httpFlag = args.indexOf("--http");

  if (process.env.HTTP_PORT || httpFlag !== -1) {
    const port = parseInt(process.env.HTTP_PORT || args[httpFlag + 1] || "", 10) || 3000;
    const corsOrigin = process.env.KAITEN_HTTP_CORS_ORIGIN;
    await startHttp(createServer, { ...config, port, corsOrigins: corsOrigin ? [corsOrigin] : [] });
  } else {
    await startStdio(createServer(), config);
  }
}

main().catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
