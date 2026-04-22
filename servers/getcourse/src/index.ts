#!/usr/bin/env node

/**
 * @theyahia/getcourse-mcp — MCP server for GetCourse API
 *
 * 3 tools: get_users, create_user, get_deals.
 * Auth: API key as query parameter.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import { getUsersSchema, handleGetUsers } from "./tools/users.js";
import { createUserSchema, handleCreateUser } from "./tools/create_user.js";
import { getDealsSchema, handleGetDeals } from "./tools/deals.js";

const logger = createLogger("getcourse-mcp");

function createServer(): McpServer {
  const server = new McpServer({
    name: "getcourse-mcp",
    version: "1.2.0",
  });

  server.tool(
    "get_users",
    "Get a list of users from GetCourse LMS with optional filters by status and registration date. Supports async export polling for large datasets. Returns up to 50 users per request with full profile details.",
    getUsersSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetUsers(params) }],
    })),
  );

  server.tool(
    "create_user",
    "Create or update a user in GetCourse LMS. Can optionally add the user to a group and create a deal with an offer code. Returns user ID and status of group/deal operations.",
    createUserSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateUser(params) }],
    })),
  );

  server.tool(
    "get_deals",
    "Get a list of deals (orders) from GetCourse with optional filters by status and creation date. Supports async export polling for large datasets. Returns up to 50 deals per request.",
    getDealsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetDeals(params) }],
    })),
  );

  return server;
}

runServer(createServer, {
  name: "getcourse-mcp",
  version: "1.2.0",
  toolCount: 3,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
