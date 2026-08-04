/**
 * Server factory + module configuration.
 *
 * Split out of index.ts so tests can import createServer / getEnabledModules
 * without triggering the side-effect runServer() call that index.ts performs
 * on direct execution.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
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
  getDocumentLinesSchema, handleGetDocumentLines,
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
  getAccountingBalanceSchema, handleGetAccountingBalance,
} from "./tools/accounting.js";
import {
  findByDescriptionSchema, handleFindByDescription,
  getByKeySchema, handleGetByKey,
  countEntitiesSchema, handleCountEntities,
  setDeletionMarkSchema, handleSetDeletionMark,
  getRecentDocumentsSchema, handleGetRecentDocuments,
} from "./tools/shortcuts.js";
import {
  batchCreateDocumentsSchema, handleBatchCreateDocuments,
  batchUpdateCatalogItemsSchema, handleBatchUpdateCatalogItems,
  batchQuerySchema, handleBatchQuery,
} from "./tools/batch.js";
import {
  pollChangesSinceSchema, handlePollChangesSince,
  listSubscriptionsSchema, handleListSubscriptions,
} from "./tools/change-tracking.js";
import {
  approveWriteSchema, handleApproveWrite,
  rollbackWriteSchema, handleRollbackWrite,
} from "./tools/safety.js";
import { registerPresetTools } from "./tools/presets.js";
import { getWriteMode } from "./lib/write-safety.js";

export const logger = createLogger("aprovodka");

/**
 * Single source of truth for the server version. Used by both `McpServer`
 * (MCP handshake) here and `runServer` (the /health endpoint) in index.ts,
 * so the two can never drift apart again. Keep in sync with package.json.
 */
export const VERSION = "4.1.0";

/**
 * Single source of truth for module → tool count mapping.
 * Used both to filter registration in createServer() and to compute the
 * tools count reported by the /health endpoint via runServer.
 * `meta` is always registered (discovery tools) — without it an LLM cannot
 * navigate an unfamiliar 1C database.
 */
export const MODULE_TOOL_COUNTS = {
  meta: 5,        // list_entities + get_document_by_number + get_metadata + describe_entity + get_config_preset — always on
  catalogs: 3,    // get_catalogs + create_catalog_item + update_catalog_item
  documents: 7,   // get/create/update + post/unpost/delete + get_document_lines
  registers: 3,   // get_register + write_information_register + get_accumulation_balance
  reports: 1,     // get_report
  odata: 1,       // odata_query
  constants: 2,   // get_constant + set_constant
  accounting: 2,  // get_accounting_register + get_accounting_balance
  shortcuts: 5,   // find_by_description + get_by_key + count_entities + set_deletion_mark + get_recent_documents
  batch: 3,       // batch_create_documents + batch_update_catalog_items + batch_query
  changes: 2,     // poll_changes_since + list_subscriptions
} as const;

export type ModuleName = keyof typeof MODULE_TOOL_COUNTS;
const OPTIONAL_MODULES: ModuleName[] = [
  "catalogs", "documents", "registers", "reports", "odata",
  "constants", "accounting", "shortcuts", "batch", "changes",
];

/**
 * ONEC_SERVICES env var filters which tool groups are registered.
 * Comma-separated list of: catalogs, documents, registers, reports, odata,
 * constants, accounting, shortcuts, batch, changes, meta.
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
  // approve_write + rollback_write exist only while the write gate is on.
  if (getWriteMode() !== "off") count += 2;
  return count;
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: "aprovodka",
    version: VERSION,
  });

  const modules = getEnabledModules();

  // --- Discovery (meta) — always enabled ---
  // Единственный инструмент, работающий без ONEC_BASE_URL, — поэтому он первый:
  // порядок регистрации это единственный намёк модели, с чего начинать. Регистрация
  // вынесена в helper (все остальные 33 объявлены здесь инлайн) — он же держит схему.
  registerPresetTools(server);

  server.tool(
    "list_entities",
    "List all available 1C OData entities: catalogs (Catalog_*), documents (Document_*), " +
    "all four register kinds (Accumulation/Information/Accounting/CalculationRegister_*), " +
    "charts (ChartOf*), constants (Constant_*), journals (DocumentJournal_*), reports (Report_*). " +
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

    server.tool(
      "get_document_lines",
      "Read a document's tabular section (строки / табличная часть, e.g. Товары) by Ref_Key " +
      "via OData $expand. The section name is configuration-specific — discover it with get_metadata / describe_entity.",
      getDocumentLinesSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetDocumentLines(params) }],
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

    server.tool(
      "get_accounting_balance",
      "Accounting-register VIRTUAL tables (AccountingRegister_*): Balance / Turnovers / " +
      "BalanceAndTurnovers / ExtDimensions. Not to be confused with get_accumulation_balance, " +
      "which serves AccumulationRegister_* — this one is the double-entry ledger (счета, субконто).",
      getAccountingBalanceSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetAccountingBalance(params) }],
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

  if (modules.has("batch")) {
    server.tool(
      "batch_create_documents",
      "Create N 1C documents in parallel (1..100 per call). 1C does NOT support OData $batch — " +
      "this is client-side parallel batching with concurrency cap and per-item success/failure reporting.",
      batchCreateDocumentsSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleBatchCreateDocuments(params) }],
      })),
    );

    server.tool(
      "batch_update_catalog_items",
      "Update N 1C catalog items in parallel (1..100). Each item updated via OData PATCH on its Ref_Key. " +
      "Per-item success/failure reported; partial failures do not abort the batch.",
      batchUpdateCatalogItemsSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleBatchUpdateCatalogItems(params) }],
      })),
    );

    server.tool(
      "batch_query",
      "Run N 1C OData queries in parallel (1..50). Each query reported individually. " +
      "No server-side join (1C does not support $batch) — combine results client-side.",
      batchQuerySchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleBatchQuery(params) }],
      })),
    );
  }

  if (modules.has("changes")) {
    server.tool(
      "poll_changes_since",
      "Poll a 1C entity for rows modified since a timestamp cursor. 1C does NOT support webhooks — " +
      "use this on a schedule (every 30-300s). Returns rows + a `next_cursor` for the next poll.",
      pollChangesSinceSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handlePollChangesSince(params) }],
      })),
    );

    server.tool(
      "list_subscriptions",
      "Documents that 1C does NOT support webhook subscriptions. Returns empty list + workaround hints " +
      "(use poll_changes_since instead). Prevents LLMs from hallucinating subscribe_to_event flows.",
      listSubscriptionsSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleListSubscriptions(params) }],
      })),
    );
  }

  // ── Write-safety gate (ONEC_WRITE_MODE=preview|approval) ──
  // Off by default: writes behave exactly as before and these tools do not exist.
  if (getWriteMode() !== "off") {
    server.tool(
      "approve_write",
      "Approve ONE pending 1C write, identified by the op_hash returned in its preview. " +
      "Single-use and time-limited: after approving, re-run the identical write tool call to execute it. " +
      "Only call this after an explicit human 'yes' — never approve your own preview unattended.",
      approveWriteSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleApproveWrite(params) }],
      })),
    );

    server.tool(
      "rollback_write",
      "Undo a completed reversible write using the rollback token from its result " +
      "(post→unpost, unpost→post, field update→restore previous values, DeletionMark toggle). " +
      "One-shot. Physical deletes and record creation have no rollback token — they are irreversible.",
      rollbackWriteSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleRollbackWrite(params) }],
      })),
    );
  }

  // ── Prompts — guided multi-tool workflows over the tools above ──
  // Always registered (independent of ONEC_SERVICES); ship with the npm package
  // so any MCP client gets them without a separate skill install.

  server.prompt(
    "inventory-database",
    "Inventory an unfamiliar 1C database — discover entities, counts and key fields.",
    {},
    async () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              "Inventory this 1C database step by step:\n" +
              "1. Call `get_config_preset` first — it works offline and tells you which " +
              "configuration (БП / УТ / ЗУП / ERP) you are likely looking at, with its typical " +
              "entity names and pitfalls. Treat entities marked confidence:\"common\" as hints " +
              "to verify, never as confirmed names.\n" +
              "2. Call `list_entities` per group instead of grouping by hand: " +
              "type=catalogs, documents, registers (all four kinds), charts, constants, " +
              "journals, reports. Use type=all only for what no filter covers " +
              "(ExchangePlan_, BusinessProcess_, Task_).\n" +
              "3. For the 5-10 most relevant entities, call `count_entities` to get row counts.\n" +
              "4. Call `describe_entity` on the key catalogs and document types to learn their fields " +
              "(use `get_metadata` only if you need exact OData types).\n" +
              "Finish with a compact summary: a table of entity groups with counts, then the field " +
              "lists of the most important entities.",
          },
        },
      ],
    }),
  );

  server.prompt(
    "find-and-post-document",
    "Find a 1C document and post (провести) it — with a mandatory human confirmation before the write.",
    {
      query: z
        .string()
        .describe("Document number (e.g. ТД-00123) or a Description substring to search for"),
      document_type: z
        .string()
        .optional()
        .describe("Document_* type if known — narrows the search"),
    },
    async ({ query, document_type }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              `Find and then post a 1C document. Search term: "${query}".\n` +
              (document_type
                ? `Document type: ${document_type}.\n`
                : "First ask me which Document_* type to search if it's not obvious.\n") +
              "1. Locate it: if the term is a number use `get_document_by_number`; if it's text use `find_by_description`.\n" +
              "2. Show me its key fields and its tabular sections via `get_document_lines` so I can verify it's the right, complete document.\n" +
              "3. STOP and ask me to confirm — do NOT call `post_document` without my explicit 'yes'. Also ask whether to use operational posting (operational=true).\n" +
              "4. After I confirm, call `post_document`. Report the result; if it fails, read the 1C error hint and propose a fix.",
          },
        },
      ],
    }),
  );

  server.prompt(
    "reconcile-balances",
    "Reconcile accumulation-register balances (остатки) against the underlying movements.",
    {
      register_name: z
        .string()
        .describe("Accumulation register name, e.g. ОстаткиТоваровНаСкладах"),
      period: z
        .string()
        .optional()
        .describe("Snapshot date YYYY-MM-DDTHH:MM:SS; omit for current balances"),
    },
    async ({ register_name, period }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              `Reconcile the accumulation register "${register_name}".\n` +
              `1. Call \`get_accumulation_balance\` (register_name="${register_name}"` +
              (period ? `, period="${period}"` : "") +
              ") to get the остатки.\n" +
              `2. Call \`get_register\` (register_type="AccumulationRegister", register_name="${register_name}") ` +
              "to read the movements (приход/расход).\n" +
              "3. Aggregate the movements per dimension and compare against the balance.\n" +
              "4. Report any discrepancies (balance ≠ sum of movements) as a table; if everything reconciles, say so. " +
              "Treat the Balance() result as authoritative and flag movement rows that don't add up.",
          },
        },
      ],
    }),
  );

  return server;
}
