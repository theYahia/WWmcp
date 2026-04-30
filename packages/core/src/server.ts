/**
 * Server factory with dual transport support (stdio + Streamable HTTP).
 *
 * Consolidates the transport setup pattern from CDEK and MoySklad
 * into a reusable factory. Includes graceful shutdown and health endpoint.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { Logger } from "./logging.js";

export interface ServerConfig {
  name: string;
  version: string;
  /** Number of tools (shown in health endpoint) */
  toolCount?: number;
  logger?: Logger;
}

export interface HttpServerConfig {
  port: number;
  /** CORS allowed origins. Use ["*"] for development only. */
  corsOrigins?: string[];
}

/**
 * Starts the MCP server with stdio transport (default for Claude Desktop/Cursor).
 */
export async function startStdio(
  server: McpServer,
  config: ServerConfig,
): Promise<void> {
  const transport = new StdioServerTransport();
  setupGracefulShutdown(config.logger);
  await server.connect(transport);
  config.logger?.info("Server started (stdio)", {
    tools: config.toolCount,
  });
}

/**
 * Starts the MCP server with Streamable HTTP transport.
 * Includes CORS, health endpoint, session management.
 */
export async function startHttp(
  createServer: () => McpServer,
  config: ServerConfig & HttpServerConfig,
): Promise<void> {
  const { randomUUID } = await import("node:crypto");

  let StreamableHTTPServerTransport: any;
  let isInitializeRequest: any;
  let express: any;

  try {
    const sdkServer = await import(
      "@modelcontextprotocol/sdk/server/streamableHttp.js"
    );
    StreamableHTTPServerTransport = sdkServer.StreamableHTTPServerTransport;
    const types = await import("@modelcontextprotocol/sdk/types.js");
    isInitializeRequest = types.isInitializeRequest;
  } catch {
    throw new Error(
      "Failed to import StreamableHTTPServerTransport. Ensure @modelcontextprotocol/sdk >= 1.12.0",
    );
  }

  try {
    // express is an optional peer dependency — only needed for HTTP transport
    // @ts-expect-error express may not be installed
    express = (await import("express")).default;
  } catch {
    throw new Error(
      "express is required for HTTP transport. Install it: pnpm add express",
    );
  }

  const app = express();
  app.use(express.json());

  // CORS
  const origins = config.corsOrigins ?? ["*"];
  app.use((_req: any, res: any, next: any) => {
    const origin = origins.includes("*") ? "*" : origins[0];
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, mcp-session-id",
    );
    if (_req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  // Health endpoint
  app.get("/health", (_req: any, res: any) => {
    res.json({
      status: "ok",
      server: config.name,
      version: config.version,
      uptime: Math.round(process.uptime()),
      memory_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      tools: config.toolCount ?? 0,
    });
  });

  // Session management
  const transports: Record<string, any> = {};

  // MCP POST
  app.post("/mcp", async (req: any, res: any) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    try {
      if (sessionId && transports[sessionId]) {
        await transports[sessionId].handleRequest(req, res, req.body);
        return;
      }

      if (!sessionId && isInitializeRequest(req.body)) {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sid: string) => {
            transports[sid] = transport;
          },
        });
        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid) delete transports[sid];
        };

        const server = createServer();
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
        return;
      }

      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Bad Request: No valid session ID" },
        id: null,
      });
    } catch (error) {
      config.logger?.error("HTTP request error", {
        error: error instanceof Error ? error.message : String(error),
      });
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  // MCP GET (SSE streams)
  app.get("/mcp", async (req: any, res: any) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      return res.status(400).send("Invalid or missing session ID");
    }
    await transports[sessionId].handleRequest(req, res);
  });

  // MCP DELETE (session termination)
  app.delete("/mcp", async (req: any, res: any) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      return res.status(400).send("Invalid or missing session ID");
    }
    await transports[sessionId].handleRequest(req, res);
  });

  app.listen(config.port, () => {
    config.logger?.info(`HTTP server listening`, {
      port: config.port,
      tools: config.toolCount,
    });
  });

  // Graceful shutdown for HTTP
  const shutdown = async (signal: string) => {
    config.logger?.info(`${signal} received, shutting down`);
    for (const sid of Object.keys(transports)) {
      await transports[sid].close();
      delete transports[sid];
    }
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

/**
 * Sets up graceful shutdown handlers for stdio mode.
 */
function setupGracefulShutdown(logger?: Logger): void {
  process.on("SIGINT", () => {
    logger?.info("SIGINT received, exiting");
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    logger?.info("SIGTERM received, exiting");
    process.exit(0);
  });
  process.on("unhandledRejection", (err) => {
    logger?.error("Unhandled rejection", {
      error: err instanceof Error ? err.message : String(err),
    });
  });
}

/**
 * Detects transport mode from CLI args / env and runs the appropriate server.
 *
 * Usage in server entry points:
 * ```ts
 * runServer(createMyServer, { name: "my-mcp", version: "1.0.0", toolCount: 5 });
 * ```
 */
export async function runServer(
  createServer: () => McpServer,
  config: ServerConfig,
): Promise<void> {
  const useHttp =
    process.argv.includes("--http") || !!process.env.HTTP_PORT;

  if (useHttp) {
    const port = parseInt(process.env.HTTP_PORT ?? "3000", 10);
    await startHttp(createServer, { ...config, port });
  } else {
    const server = createServer();
    await startStdio(server, config);
  }
}
