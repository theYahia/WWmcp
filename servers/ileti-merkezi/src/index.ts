#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { IletiMerkeziClient, MissingCredentialsError, readCredentials } from "./client.js";
import { buildTools } from "./tools.js";
import { SERVER_NAME, VERSION } from "./version.js";

async function main(): Promise<void> {
  // Fail fast on missing credentials so the server never starts half-configured.
  let creds;
  try {
    creds = readCredentials();
  } catch (error) {
    if (error instanceof MissingCredentialsError) {
      console.error(`[${SERVER_NAME}] ${error.message}`);
      process.exit(1);
    }
    throw error;
  }

  const client = new IletiMerkeziClient(creds);
  const server = new McpServer({ name: SERVER_NAME, version: VERSION });

  const tools = buildTools(client);
  for (const tool of tools) {
    server.registerTool(
      tool.name,
      tool.config,
      tool.handler as Parameters<typeof server.registerTool>[2],
    );
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdout is reserved for the JSON-RPC stream; all logging goes to stderr.
  console.error(`[${SERVER_NAME}] v${VERSION} started — ${tools.length} tools available.`);
}

main().catch((error) => {
  console.error(`[${SERVER_NAME}] Fatal:`, error);
  process.exit(1);
});
