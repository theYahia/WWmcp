#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createLogger } from "@theyahia/mcp-core";
import { createMcpServer, startHttpMode, TOOL_COUNT } from "./server.js";

const logger = createLogger("tilda-mcp");

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const httpMode = args.includes("--http");
  const portIdx = args.indexOf("--port");
  const parsedPort = portIdx !== -1 ? parseInt(args[portIdx + 1], 10) : NaN;
  const port = Number.isFinite(parsedPort) ? parsedPort : 3001;

  if (httpMode) {
    await startHttpMode(port);
  } else {
    const server = createMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info("Сервер запущен (stdio)", { tools: TOOL_COUNT, requires: "TILDA_PUBLIC_KEY + TILDA_SECRET_KEY" });
  }
}

main().catch((error) => {
  logger.error("Фатальная ошибка", { error: error instanceof Error ? error.message : String(error) });
  process.exit(1);
});

export { createMcpServer } from "./server.js";
