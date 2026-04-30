/**
 * Server factory + module configuration.
 *
 * Split out of index.ts so tests can import createServer / getEnabledModules
 * without triggering the side-effect runServer() call that index.ts performs
 * on direct execution.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
import { getCatalogsSchema, handleGetCatalogs } from "./tools/catalogs.js";
import {
  getDocumentsSchema, handleGetDocuments,
  createDocumentSchema, handleCreateDocument,
  updateDocumentSchema, handleUpdateDocument,
} from "./tools/documents.js";
import { getRegisterSchema, handleGetRegister } from "./tools/registers.js";
import { getReportSchema, handleGetReport } from "./tools/reports.js";
import { odataQuerySchema, handleODataQuery } from "./tools/odata-query.js";
import {
  listEntitiesSchema, handleListEntities,
  getDocumentByNumberSchema, handleGetDocumentByNumber,
} from "./tools/metadata.js";

export const logger = createLogger("1c-rest-mcp");

/**
 * Single source of truth for module → tool count mapping.
 * Used both to filter registration in createServer() and to compute the
 * tools count reported by the /health endpoint via runServer.
 * `meta` is always registered (discovery tools) — without it an LLM cannot
 * navigate an unfamiliar 1C database.
 */
export const MODULE_TOOL_COUNTS = {
  meta: 2,        // list_entities + get_document_by_number — always on
  catalogs: 1,    // get_catalogs
  documents: 3,   // get_documents + create_document + update_document
  registers: 1,   // get_register
  reports: 1,     // get_report
  odata: 1,       // odata_query
} as const;

export type ModuleName = keyof typeof MODULE_TOOL_COUNTS;
const OPTIONAL_MODULES: ModuleName[] = ["catalogs", "documents", "registers", "reports", "odata"];

/**
 * ONEC_SERVICES env var filters which tool groups are registered.
 * Comma-separated list of: catalogs, documents, registers, reports, odata, meta.
 * Default ("all" or unset) — all tools registered.
 */
export function getEnabledModules(): Set<ModuleName> {
  const enabled = new Set<ModuleName>(["meta"]);
  const env = process.env["ONEC_SERVICES"];
  if (!env || env.trim() === "" || env.trim() === "all") {
    OPTIONAL_MODULES.forEach((m) => enabled.add(m));
    return enabled;
  }
  for (const raw of env.split(",")) {
    const m = raw.trim().toLowerCase() as ModuleName;
    if (m in MODULE_TOOL_COUNTS) enabled.add(m);
  }
  return enabled;
}

export function countRegisteredTools(modules: Set<ModuleName>): number {
  let count = 0;
  for (const m of modules) count += MODULE_TOOL_COUNTS[m];
  return count;
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: "1c-rest-mcp",
    version: "2.0.0",
  });

  const modules = getEnabledModules();

  // --- Discovery (meta) — always enabled ---
  server.tool(
    "list_entities",
    "List all available 1C OData entities: catalogs (Catalog_*), documents (Document_*), " +
    "registers (AccumulationRegister_*, InformationRegister_*), reports (Report_*). " +
    "Use this first when working with an unfamiliar database.",
    listEntitiesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListEntities(params) }],
    })),
  );

  server.tool(
    "get_document_by_number",
    "Find a 1C document by its number. Convenience wrapper over OData $filter. " +
    "Example: locate invoice ТД-00123 dated 2025-03-01.",
    getDocumentByNumberSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetDocumentByNumber(params) }],
    })),
  );

  if (modules.has("catalogs")) {
    server.tool(
      "get_catalogs",
      "Read 1C catalog data via OData 3.0. Supports $filter, $select, $orderby, $top, $skip.",
      getCatalogsSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetCatalogs(params) }],
      })),
    );
  }

  if (modules.has("documents")) {
    server.tool(
      "get_documents",
      "Read 1C documents via OData 3.0. Filter by date, type, or arbitrary fields.",
      getDocumentsSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetDocuments(params) }],
      })),
    );

    server.tool(
      "create_document",
      "Create a new 1C document via OData POST.",
      createDocumentSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleCreateDocument(params) }],
      })),
    );

    server.tool(
      "update_document",
      "Update an existing 1C document via OData PATCH (by Ref_Key GUID).",
      updateDocumentSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleUpdateDocument(params) }],
      })),
    );
  }

  if (modules.has("registers")) {
    server.tool(
      "get_register",
      "Read 1C information or accumulation register data via OData 3.0.",
      getRegisterSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetRegister(params) }],
      })),
    );
  }

  if (modules.has("reports")) {
    server.tool(
      "get_report",
      "Get a 1C report via an arbitrary HTTP service URL (/hs/...).",
      getReportSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetReport(params) }],
      })),
    );
  }

  if (modules.has("odata")) {
    server.tool(
      "odata_query",
      "Run an arbitrary OData 3.0 query against any 1C entity. Supports $filter, $select, $expand, $orderby, $top, $skip, $inlinecount.",
      odataQuerySchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleODataQuery(params) }],
      })),
    );
  }

  return server;
}
