#!/usr/bin/env node

/**
 * @theyahia/kontur-diadoc-mcp — MCP server for Kontur.Diadoc EDI (Russia)
 *
 * 8 tools: authenticate, list_organizations, get_organization, list_documents,
 * get_document, send_document, sign_document, list_counterparties.
 * Auth: DIADOC_API_CLIENT_ID + DIADOC_LOGIN + DIADOC_PASSWORD.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import {
  authenticateSchema,
  getDocumentSchema,
  getOrganizationSchema,
  handleAuthenticate,
  handleGetDocument,
  handleGetOrganization,
  handleListCounterparties,
  handleListDocuments,
  handleListOrganizations,
  handleSendDocument,
  handleSignDocument,
  listCounterpartiesSchema,
  listDocumentsSchema,
  listOrganizationsSchema,
  sendDocumentSchema,
  signDocumentSchema,
} from "./tools/documents.js";

function resolveVersion(): string {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(readFileSync(join(here, "..", "package.json"), "utf8")) as {
      version?: string;
    };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

const VERSION = resolveVersion();
const TOOL_COUNT = 8;
const logger = createLogger("kontur-diadoc-mcp");

function createServer(): McpServer {
  const server = new McpServer({ name: "kontur-diadoc-mcp", version: VERSION });

  server.tool(
    "authenticate",
    "Аутентификация в Kontur.Diadoc API (возвращает превью токена). / Authenticate with Diadoc.",
    authenticateSchema.shape,
    withErrorHandling(async () => ({
      content: [{ type: "text", text: await handleAuthenticate() }],
    })),
  );

  server.tool(
    "list_organizations",
    "Поиск организаций по ИНН/КПП в Diadoc. / Search organizations by INN/KPP.",
    listOrganizationsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListOrganizations(params) }],
    })),
  );

  server.tool(
    "get_organization",
    "Детали организации по orgId / boxId / ИНН. / Get organization details.",
    getOrganizationSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetOrganization(params) }],
    })),
  );

  server.tool(
    "list_documents",
    "Список документов в ящике с фильтрами и пагинацией. / List documents in a box.",
    listDocumentsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListDocuments(params) }],
    })),
  );

  server.tool(
    "get_document",
    "Получить конкретный документ по box/message/entity ID. / Get a specific document.",
    getDocumentSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetDocument(params) }],
    })),
  );

  server.tool(
    "send_document",
    "Отправить документ контрагенту. Подпись (base64) формирует клиент; для песочницы шлите без подписи. / Send a document; the client supplies the signature.",
    sendDocumentSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSendDocument(params) }],
    })),
  );

  server.tool(
    "sign_document",
    "Подписать входящий документ. Нужна готовая подпись (base64) или sign_with_test_signature в песочнице. / Sign a received document with a client-supplied signature.",
    signDocumentSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSignDocument(params) }],
    })),
  );

  server.tool(
    "list_counterparties",
    "Список контрагентов организации (myBoxId). / List counterparties for an organization.",
    listCounterpartiesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListCounterparties(params) }],
    })),
  );

  return server;
}

runServer(createServer, {
  name: "kontur-diadoc-mcp",
  version: VERSION,
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
