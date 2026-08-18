import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { type NextFunction, type Request, type Response } from "express";
import { randomUUID } from "node:crypto";
import type { Server } from "node:http";
import { TOOL_COUNT, PROMPT_COUNT } from "./meta.js";

interface Session {
  transport: StreamableHTTPServerTransport;
  lastSeen: number;
}

/** Close a transport without caring about the result (sync throw or async rejection). */
function closeQuietly(transport: StreamableHTTPServerTransport): void {
  void Promise.resolve()
    .then(() => transport.close())
    .catch(() => {
      /* ignore */
    });
}

export async function startHttpServer(
  createMcpServer: () => McpServer,
  port: number,
): Promise<Server> {
  const host = process.env.HOST ?? "127.0.0.1";

  // Fail closed: this server proxies live Megaplan credentials, so refuse to
  // start --http without an auth token rather than expose tools unauthenticated.
  const httpToken = process.env.MCP_HTTP_TOKEN;
  if (!httpToken) {
    throw new Error(
      "MCP_HTTP_TOKEN must be set for --http mode (refusing to expose Megaplan tools without authentication).",
    );
  }

  const allowedHosts = (process.env.MCP_HTTP_ALLOWED_HOSTS ?? `127.0.0.1:${port},localhost:${port}`)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const maxSessions = Number(process.env.MCP_HTTP_MAX_SESSIONS ?? 100);
  const idleMs = Number(process.env.MCP_HTTP_SESSION_TTL_MS ?? 30 * 60 * 1000);

  const app = express();
  app.use(express.json({ limit: process.env.MCP_HTTP_BODY_LIMIT ?? "1mb" }));

  // Bearer auth in front of every /mcp route.
  app.use("/mcp", (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization !== `Bearer ${httpToken}`) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    next();
  });

  const transports = new Map<string, Session>();

  // Evict idle/abandoned sessions so the map (and its live transports) can't grow without bound.
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [id, session] of transports) {
      if (now - session.lastSeen > idleMs) {
        closeQuietly(session.transport);
        transports.delete(id);
      }
    }
  }, 60_000);
  sweep.unref?.();

  app.post("/mcp", async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;

      if (sessionId && transports.has(sessionId)) {
        const session = transports.get(sessionId)!;
        session.lastSeen = Date.now();
        await session.transport.handleRequest(req, res, req.body);
        return;
      }

      if (transports.size >= maxSessions) {
        res.status(503).json({ error: "too many sessions" });
        return;
      }

      const newSessionId = randomUUID();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => newSessionId,
        enableDnsRebindingProtection: true,
        allowedHosts,
        allowedOrigins: [],
      });
      transport.onclose = () => transports.delete(newSessionId);

      // A fresh McpServer per session (an McpServer is 1:1 with a transport).
      await createMcpServer().connect(transport);
      transports.set(newSessionId, { transport, lastSeen: Date.now() });
      try {
        await transport.handleRequest(req, res, req.body);
      } catch (error) {
        // Roll back the session we just created if the first request failed.
        transports.delete(newSessionId);
        closeQuietly(transport);
        throw error;
      }
    } catch (error) {
      console.error("[megaplan-mcp] POST /mcp error:", error);
      if (!res.headersSent) res.status(500).json({ error: "internal error" });
    }
  });

  app.get("/mcp", async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      if (!sessionId || !transports.has(sessionId)) {
        res.status(400).json({ error: "No valid session. POST /mcp first." });
        return;
      }
      const session = transports.get(sessionId)!;
      session.lastSeen = Date.now();
      await session.transport.handleRequest(req, res);
    } catch (error) {
      console.error("[megaplan-mcp] GET /mcp error:", error);
      if (!res.headersSent) res.status(500).json({ error: "internal error" });
    }
  });

  app.delete("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    const session = sessionId ? transports.get(sessionId) : undefined;
    if (!session) {
      res.status(200).end();
      return;
    }
    try {
      await session.transport.handleRequest(req, res);
    } catch (error) {
      console.error("[megaplan-mcp] DELETE /mcp error:", error);
      if (!res.headersSent) res.status(500).json({ error: "internal error" });
    } finally {
      // Always tear down the session, even if handleRequest threw.
      closeQuietly(session.transport);
      transports.delete(sessionId!);
    }
  });

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", tools: TOOL_COUNT, prompts: PROMPT_COUNT, sessions: transports.size });
  });

  // Body-parser / payload-size error handler (must be last, 4-arg signature).
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (!err) {
      next();
      return;
    }
    const tooLarge = (err as { type?: string }).type === "entity.too.large";
    console.error("[megaplan-mcp] request error:", err);
    if (!res.headersSent) res.status(tooLarge ? 413 : 400).json({ error: "bad request" });
  });

  return new Promise<Server>((resolve) => {
    const httpServer = app.listen(port, host, () => {
      const bound = httpServer.address();
      const shownPort = typeof bound === "object" && bound ? bound.port : port;
      console.error(
        `[megaplan-mcp] HTTP server on http://${host}:${shownPort}/mcp (Streamable HTTP, auth required)`,
      );
      console.error(`[megaplan-mcp] Health: http://${host}:${shownPort}/health`);
      resolve(httpServer);
    });
    httpServer.on("close", () => clearInterval(sweep));
  });
}
