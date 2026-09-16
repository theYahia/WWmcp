import type { Server as HttpServer, ServerResponse } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
import {
  getProjectsSchema, handleGetProjects,
  getProjectInfoSchema, handleGetProjectInfo,
  getPagesSchema, handleGetPages,
  getPageSchema, handleGetPage,
  getPageBodySchema, handleGetPageBody,
  getPageExportSchema, handleGetPageExport,
  getPageExportBodySchema, handleGetPageExportBody,
} from "./tools/pages.js";

const logger = createLogger("tilda-mcp");

export const VERSION = "1.2.0";

// Single source of truth for the tool set — used by both transports and /health.
export const TOOL_NAMES = [
  "get_projects",
  "get_project_info",
  "get_pages",
  "get_page",
  "get_page_body",
  "get_page_export",
  "get_page_export_body",
] as const;
export const TOOL_COUNT = TOOL_NAMES.length;

const MAX_BODY_BYTES = 1_000_000;

/**
 * Wrap a handler with the fleet-wide guard from core: thrown errors become isError
 * content instead of a protocol error, AND successful output passes through
 * prompt-injection stripping + the 50 000-char truncation cap. The previous local
 * wrapper did neither, which mattered most here — these tools return whole Tilda
 * pages (attacker-authorable HTML, easily megabytes) straight into the model context.
 */
function wrap<P>(handler: (params: P) => Promise<string>) {
  return withErrorHandling<P>(async (params) => ({
    content: [{ type: "text" as const, text: await handler(params) }],
  }));
}

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: "tilda-mcp", version: VERSION });

  server.tool(
    "get_projects",
    "Получить список проектов Tilda.",
    getProjectsSchema.shape,
    wrap(handleGetProjects),
  );

  server.tool(
    "get_project_info",
    "Получить подробную информацию о проекте Tilda (домен, настройки экспорта). Опц. webconfig=htaccess|nginx — пример конфига веб-сервера.",
    getProjectInfoSchema.shape,
    wrap(handleGetProjectInfo),
  );

  server.tool(
    "get_pages",
    "Получить список страниц проекта Tilda.",
    getPagesSchema.shape,
    wrap(handleGetPages),
  );

  server.tool(
    "get_page",
    "Получить полную страницу Tilda (HTML с <head>, CSS, JS; ссылки на Tilda CDN). metadata_only=true — без html/css/js.",
    getPageSchema.shape,
    wrap(handleGetPage),
  );

  server.tool(
    "get_page_body",
    "Получить только тело страницы Tilda (HTML без <head>; ссылки на Tilda CDN) — для быстрого чтения/preview. metadata_only=true — без html/css/js.",
    getPageBodySchema.shape,
    wrap(handleGetPageBody),
  );

  server.tool(
    "get_page_export",
    "Экспорт полной страницы Tilda для самостоятельного хостинга (HTML с <head> + локализованные ассеты {from,to}). metadata_only=true — без html/css/js.",
    getPageExportSchema.shape,
    wrap(handleGetPageExport),
  );

  server.tool(
    "get_page_export_body",
    "Экспорт тела страницы Tilda с локализованными ассетами {from,to} (без <head>) — для вставки в свой шаблон/CMS. metadata_only=true — без html/css/js.",
    getPageExportBodySchema.shape,
    wrap(handleGetPageExportBody),
  );

  return server;
}

// SECURITY (audit finding, unfixed — needs a test change, see tests/http.test.ts:31):
// `Access-Control-Allow-Origin: *` on an endpoint that has NO authentication means any
// page the user visits can POST to this server on localhost AND READ the response —
// i.e. exfiltrate the whole Tilda account through the browser. @theyahia/mcp-core's
// startHttp defaults to deny-all for exactly this reason, and yookassa uses an explicit
// allow-list. Fix is an origin allow-list (env TILDA_HTTP_ALLOWED_ORIGINS, default deny),
// but tests/http.test.ts:31 asserts the "*" and tests were out of scope for this change.
function setCors(res: ServerResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, mcp-session-id, Authorization");
}

function jsonError(res: ServerResponse, status: number, message: string, headers: Record<string, string> = {}): void {
  res.writeHead(status, { "Content-Type": "application/json", ...headers });
  res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: status === 400 ? -32700 : -32000, message }, id: null }));
}

/**
 * Streamable HTTP transport in stateless mode: a fresh McpServer + transport is created per
 * request (sessionIdGenerator: undefined) and torn down on response close. This suits a pure
 * stateless API wrapper and avoids the cross-client races of a single shared transport.
 * Resolves with the listening http.Server (useful for tests).
 */
export async function startHttpMode(port: number): Promise<HttpServer> {
  const { StreamableHTTPServerTransport } = await import("@modelcontextprotocol/sdk/server/streamableHttp.js");
  const { createServer } = await import("node:http");

  const httpServer = createServer(async (req, res) => {
    setCors(res);
    const url = new URL(req.url ?? "/", `http://localhost:${port}`);

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (url.pathname === "/health") {
      if (req.method !== "GET") return jsonError(res, 405, "Method Not Allowed", { Allow: "GET" });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", tools: TOOL_COUNT }));
      return;
    }

    if (url.pathname === "/mcp") {
      if (req.method !== "POST") {
        return jsonError(res, 405, "Method Not Allowed — используйте POST (stateless режим)", { Allow: "POST, OPTIONS" });
      }

      let body: unknown;
      try {
        const chunks: Buffer[] = [];
        let total = 0;
        let tooLarge = false;
        for await (const chunk of req) {
          const buf = chunk as Buffer;
          total += buf.length;
          if (total > MAX_BODY_BYTES) {
            tooLarge = true;
            break; // breaking lets the async iterator destroy the request stream cleanly
          }
          chunks.push(buf);
        }
        if (tooLarge) return jsonError(res, 413, "Тело запроса слишком большое");
        const raw = Buffer.concat(chunks).toString("utf8");
        body = raw.length ? JSON.parse(raw) : undefined;
      } catch {
        if (!res.headersSent) jsonError(res, 400, "Невалидный JSON в теле запроса");
        return;
      }

      const server = createMcpServer();
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      try {
        await server.connect(transport);
      } catch {
        void transport.close();
        void server.close();
        if (!res.headersSent) jsonError(res, 500, "Не удалось инициализировать MCP-сервер");
        return;
      }

      // Register teardown only after a successful connect (avoid closing an unconnected transport).
      let cleaned = false;
      const cleanup = (): void => {
        if (cleaned) return;
        cleaned = true;
        void transport.close();
        void server.close();
      };
      res.on("close", cleanup);
      try {
        await transport.handleRequest(req, res, body);
      } catch {
        cleanup();
        if (!res.headersSent) jsonError(res, 500, "Ошибка обработки MCP-запроса");
      }
      return;
    }

    jsonError(res, 404, "Not Found");
  });

  return new Promise((resolve) => {
    httpServer.listen(port, () => {
      logger.info("HTTP режим (stateless)", { port, path: "/mcp", tools: TOOL_COUNT });
      resolve(httpServer);
    });
  });
}
