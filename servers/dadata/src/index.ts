#!/usr/bin/env node

/**
 * @metarebalance/dadata-mcp — MCP server for DaData.ru API
 *
 * Full coverage of DaData API: 31 tools, 2 resources, 2 prompts.
 * Addresses, companies, banks, FIO, phones, email, passports,
 * vehicles, logistics, and 9 reference directories.
 * Auth: DADATA_API_KEY (required), DADATA_SECRET_KEY (paid clean_* tools).
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT).
 *
 * Security:
 *   - stdout is reserved for JSON-RPC — all logs go to stderr
 *   - API keys are never logged or included in error responses
 *   - Input validation via Zod on every tool call
 *   - Tool output passes through mcp-core sanitization (withErrorHandling)
 *   - Hard timeout (10s) on all API requests
 */

import { runServer } from "@theyahia/mcp-core";
import {
  createServer,
  logger,
  SERVER_NAME,
  TOOL_COUNT,
  VERSION,
} from "./server.js";

if (!process.env.DADATA_API_KEY) {
  logger.error(
    "DADATA_API_KEY is not set. Get your free key at https://dadata.ru/profile/#info " +
      "and add it to your MCP client env configuration.",
  );
  process.exit(1);
}

if (!process.env.DADATA_SECRET_KEY) {
  logger.info(
    "DADATA_SECRET_KEY is not set. Suggest tools (free) will work; " +
      "clean tools (paid) will return an error.",
  );
}

runServer(createServer, {
  name: SERVER_NAME,
  version: VERSION,
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
