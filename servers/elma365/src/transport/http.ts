import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { VERSION } from "../version.js";

/**
 * Разрешённые значения заголовка Host (защита от DNS-rebinding).
 * По умолчанию — только localloop. Расширяется через ELMA365_ALLOWED_HOSTS (через запятую).
 */
function allowedHosts(port: number): Set<string> {
  const base = [
    "localhost", `localhost:${port}`,
    "127.0.0.1", `127.0.0.1:${port}`,
    "[::1]", `[::1]:${port}`,
  ];
  const extra = (process.env.ELMA365_ALLOWED_HOSTS ?? "")
    .split(",")
    .map(h => h.trim().toLowerCase())
    .filter(Boolean);
  return new Set([...base, ...extra]);
}

export async function startHttpTransport(server: McpServer, port: number): Promise<void> {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => randomUUID() });
  await server.connect(transport);

  const hosts = allowedHosts(port);

  const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    // DNS-rebinding protection: отклоняем запросы с неизвестным Host.
    const host = (req.headers.host ?? "").toLowerCase();
    if (!hosts.has(host)) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: `Host '${req.headers.host ?? ""}' не разрешён. Настройте ELMA365_ALLOWED_HOSTS.` }));
      return;
    }

    const url = new URL(req.url ?? "/", `http://${host}`);

    if (url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        status: "ok",
        server: "elma365-mcp",
        version: VERSION,
        config: {
          domainConfigured: Boolean(process.env.ELMA365_DOMAIN || process.env.ELMA365_BASE_URL),
          tokenConfigured: Boolean(process.env.ELMA365_TOKEN),
        },
      }));
      return;
    }

    if (url.pathname === "/mcp") {
      await transport.handleRequest(req, res);
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found. Use /mcp or /health" }));
  });

  httpServer.listen(port, () => {
    console.error(`[elma365-mcp] HTTP transport on http://localhost:${port}/mcp`);
    console.error("[elma365-mcp] Не публикуйте этот порт в интернет напрямую — транспорт без аутентификации.");
  });
}
