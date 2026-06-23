/**
 * Server factory + module configuration.
 *
 * Split out of index.ts so tests can import createServer / getEnabledModules
 * without triggering the side-effect runServer() call that index.ts performs
 * on direct execution.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
import {
  getCatalogsSchema, handleGetCatalogs,
  createCatalogItemSchema, handleCreateCatalogItem,
  updateCatalogItemSchema, handleUpdateCatalogItem,
} from "./tools/catalogs.js";
import {
  getDocumentsSchema, handleGetDocuments,
  createDocumentSchema, handleCreateDocument,
  updateDocumentSchema, handleUpdateDocument,
  postDocumentSchema, handlePostDocument,
  unpostDocumentSchema, handleUnpostDocument,
  deleteDocumentSchema, handleDeleteDocument,
} from "./tools/documents.js";
import {
  getRegisterSchema, handleGetRegister,
  writeInformationRegisterSchema, handleWriteInformationRegister,
  getAccumulationBalanceSchema, handleGetAccumulationBalance,
} from "./tools/registers.js";
import { getReportSchema, handleGetReport } from "./tools/reports.js";
import { odataQuerySchema, handleODataQuery } from "./tools/odata-query.js";
import {
  listEntitiesSchema, handleListEntities,
  getDocumentByNumberSchema, handleGetDocumentByNumber,
  getMetadataSchema, handleGetMetadata,
  describeEntitySchema, handleDescribeEntity,
} from "./tools/metadata.js";
import {
  getConstantSchema, handleGetConstant,
  setConstantSchema, handleSetConstant,
} from "./tools/constants.js";
import {
  getAccountingRegisterSchema, handleGetAccountingRegister,
} from "./tools/accounting.js";
import {
  findByDescriptionSchema, handleFindByDescription,
  getByKeySchema, handleGetByKey,
  countEntitiesSchema, handleCountEntities,
  setDeletionMarkSchema, handleSetDeletionMark,
  getRecentDocumentsSchema, handleGetRecentDocuments,
} from "./tools/shortcuts.js";

export const logger = createLogger("1c-rest-mcp");

/**
 * Single source of truth for the server version. Used by both `McpServer`
 * (MCP handshake) here and `runServer` (the /health endpoint) in index.ts,
 * so the two can never drift apart again. Keep in sync with package.json.
 */
export const VERSION = "3.1.0";

/**
 * Single source of truth for module → tool count mapping.
 * Used both to filter registration in createServer() and to compute the
 * tools count reported by the /health endpoint via runServer.
 * `meta` is always registered (discovery tools) — without it an LLM cannot
 * navigate an unfamiliar 1C database.
 */
export const MODULE_TOOL_COUNTS = {
  meta: 4,        // list_entities + get_document_by_number + get_metadata + describe_entity — always on
  catalogs: 3,    // get_catalogs + create_catalog_item + update_catalog_item
  documents: 6,   // get/create/update + post/unpost/delete
  registers: 3,   // get_register + write_information_register + get_accumulation_balance
  reports: 1,     // get_report
  odata: 1,       // odata_query
  constants: 2,   // get_constant + set_constant
  accounting: 1,  // get_accounting_register
  shortcuts: 5,   // find_by_description + get_by_key + count_entities + set_deletion_mark + get_recent_documents
} as const;

export type ModuleName = keyof typeof MODULE_TOOL_COUNTS;
const OPTIONAL_MODULES: ModuleName[] = [
  "catalogs", "documents", "registers", "reports", "odata",
  "constants", "accounting", "shortcuts",
];

/**
 * ONEC_SERVICES env var filters which tool groups are registered.
 * Comma-separated list of: catalogs, documents, registers, reports, odata,
 * constants, accounting, shortcuts, meta.
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
    version: VERSION,
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

  server.tool(
    "get_metadata",
    "Return the raw 1C OData $metadata document (EDMX/XML) describing every entity, " +
    "field and type in the database. Use for exact schema; for a quick field list prefer describe_entity.",
    getMetadataSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetMetadata(params) }],
    })),
  );

  server.tool(
    "describe_entity",
    "List the fields of a 1C entity by inspecting one sample record ($top=1). " +
    "Cheaper than reading full $metadata when you only need field names of one entity.",
    describeEntitySchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleDescribeEntity(params) }],
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

    server.tool(
      "create_catalog_item",
      "Create a new catalog item via OData POST (e.g. add a Контрагент or Номенклатура).",
      createCatalogItemSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleCreateCatalogItem(params) }],
      })),
    );

    server.tool(
      "update_catalog_item",
      "Update an existing catalog item via OData PATCH (by Ref_Key GUID).",
      updateCatalogItemSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleUpdateCatalogItem(params) }],
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

    server.tool(
      "post_document",
      "Post (провести) a 1C document via the OData bound action Post(). " +
      "Set operational=true for оперативное проведение.",
      postDocumentSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handlePostDocument(params) }],
      })),
    );

    server.tool(
      "unpost_document",
      "Unpost (отменить проведение) a 1C document via the OData bound action Unpost().",
      unpostDocumentSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleUnpostDocument(params) }],
      })),
    );

    server.tool(
      "delete_document",
      "Physically delete a 1C document via OData DELETE (by Ref_Key). " +
      "Prefer set_deletion_mark for a recoverable soft delete.",
      deleteDocumentSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleDeleteDocument(params) }],
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

    server.tool(
      "write_information_register",
      "Write a record into an independent information register (OData POST on InformationRegister_*).",
      writeInformationRegisterSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleWriteInformationRegister(params) }],
      })),
    );

    server.tool(
      "get_accumulation_balance",
      "Get accumulation-register balances (остатки) via the 1C OData virtual method " +
      "Balance(Period=…,Condition=…). Omit period for current balances.",
      getAccumulationBalanceSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetAccumulationBalance(params) }],
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

  if (modules.has("constants")) {
    server.tool(
      "get_constant",
      "Read a 1C constant value (Constant_*).",
      getConstantSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetConstant(params) }],
      })),
    );

    server.tool(
      "set_constant",
      "Write a 1C constant value via OData PATCH (Value field).",
      setConstantSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleSetConstant(params) }],
      })),
    );
  }

  if (modules.has("accounting")) {
    server.tool(
      "get_accounting_register",
      "Read accounting-register records (AccountingRegister_*, e.g. Хозрасчетный — проводки) via OData.",
      getAccountingRegisterSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetAccountingRegister(params) }],
      })),
    );
  }

  if (modules.has("shortcuts")) {
    server.tool(
      "find_by_description",
      "Fuzzy-find items by a substring of their Description (OData substringof).",
      findByDescriptionSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleFindByDescription(params) }],
      })),
    );

    server.tool(
      "get_by_key",
      "Fetch a single 1C record by its Ref_Key (GUID).",
      getByKeySchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetByKey(params) }],
      })),
    );

    server.tool(
      "count_entities",
      "Count records of an entity ($inlinecount, $top=0) with an optional filter.",
      countEntitiesSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleCountEntities(params) }],
      })),
    );

    server.tool(
      "set_deletion_mark",
      "Set or clear the DeletionMark on a catalog item or document (recoverable soft delete).",
      setDeletionMarkSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleSetDeletionMark(params) }],
      })),
    );

    server.tool(
      "get_recent_documents",
      "Get the most recent documents of a type, ordered by Date desc (optionally posted only).",
      getRecentDocumentsSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetRecentDocuments(params) }],
      })),
    );
  }

  return server;
}
