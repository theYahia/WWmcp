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
  // Первым — потому что он офлайновый (в базу не ходит, ONEC_BASE_URL не требует) и
  // отвечает на вопрос «что это вообще за конфигурация» до первого запроса; порядок
  // регистрации это единственный намёк модели, с чего начинать. Не единственный
  // офлайновый инструмент: list_subscriptions тоже отвечает статикой. Регистрация
  // вынесена в helper (остальные 33 объявлены здесь инлайн) — он же держит схему.
  registerPresetTools(server);

  server.tool(
    "list_entities",
    "Список всех доступных сущностей 1С в OData: справочники (Catalog_*), документы (Document_*), все " +
    "четыре вида регистров (Accumulation/Information/Accounting/CalculationRegister_*), планы видов " +
    "характеристик и счетов (ChartOf*), константы (Constant_*), журналы документов " +
    "(DocumentJournal_*), отчёты (Report_*). Вызывать первым при работе с незнакомой базой.",
    listEntitiesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListEntities(params) }],
    })),
  );

  server.tool(
    "get_document_by_number",
    "Поиск документа 1С по номеру. Обёртка над OData $filter. Пример: найти реализацию ТД-00123 от " +
    "2025-03-01.",
    getDocumentByNumberSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetDocumentByNumber(params) }],
    })),
  );

  server.tool(
    "get_metadata",
    "Возвращает исходный документ $metadata базы 1С (EDMX/XML) с описанием всех сущностей, полей и " +
    "типов. Нужен для точной схемы; если требуется только список полей одной сущности, дешевле " +
    "describe_entity.",
    getMetadataSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetMetadata(params) }],
    })),
  );

  server.tool(
    "describe_entity",
    "Список полей сущности 1С по одной образцовой записи ($top=1). Дешевле полного $metadata, когда " +
    "нужны только имена полей одной сущности.",
    describeEntitySchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleDescribeEntity(params) }],
    })),
  );

  if (modules.has("catalogs")) {
    server.tool(
      "get_catalogs",
      "Чтение данных справочников 1С через OData 3.0. Поддерживает $filter, $select, $orderby, $top, " +
      "$skip.",
      getCatalogsSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetCatalogs(params) }],
      })),
    );

    server.tool(
      "create_catalog_item",
      "Создание нового элемента справочника через OData POST (например, добавить Контрагента или " +
      "позицию Номенклатуры).",
      createCatalogItemSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleCreateCatalogItem(params) }],
      })),
    );

    server.tool(
      "update_catalog_item",
      "Изменение существующего элемента справочника через OData PATCH (по Ref_Key, GUID).",
      updateCatalogItemSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleUpdateCatalogItem(params) }],
      })),
    );
  }

  if (modules.has("documents")) {
    server.tool(
      "get_documents",
      "Чтение документов 1С через OData 3.0. Отбор по дате, виду документа или произвольным полям.",
      getDocumentsSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetDocuments(params) }],
      })),
    );

    server.tool(
      "create_document",
      "Создание нового документа 1С через OData POST.",
      createDocumentSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleCreateDocument(params) }],
      })),
    );

    server.tool(
      "update_document",
      "Изменение существующего документа 1С через OData PATCH (по Ref_Key, GUID).",
      updateDocumentSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleUpdateDocument(params) }],
      })),
    );

    server.tool(
      "post_document",
      "Проведение документа 1С через связанное действие OData Post(). Для оперативного проведения " +
      "указать operational=true.",
      postDocumentSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handlePostDocument(params) }],
      })),
    );

    server.tool(
      "unpost_document",
      "Отмена проведения документа 1С через связанное действие OData Unpost().",
      unpostDocumentSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleUnpostDocument(params) }],
      })),
    );

    server.tool(
      "delete_document",
      "Физическое удаление документа 1С через OData DELETE (по Ref_Key). Для обратимого удаления " +
      "предпочтительнее set_deletion_mark — он ставит пометку на удаление.",
      deleteDocumentSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleDeleteDocument(params) }],
      })),
    );

    server.tool(
      "get_document_lines",
      "Чтение табличной части документа (строки, например Товары) по Ref_Key через OData $expand. Имя " +
      "табличной части зависит от конфигурации — узнать его можно через get_metadata или " +
      "describe_entity.",
      getDocumentLinesSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetDocumentLines(params) }],
      })),
    );
  }

  if (modules.has("registers")) {
    server.tool(
      "get_register",
      "Чтение данных регистров сведений и накопления 1С через OData 3.0.",
      getRegisterSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetRegister(params) }],
      })),
    );

    server.tool(
      "write_information_register",
      "Запись в независимый регистр сведений (OData POST на InformationRegister_*).",
      writeInformationRegisterSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleWriteInformationRegister(params) }],
      })),
    );

    server.tool(
      "get_accumulation_balance",
      "Остатки регистра накопления через виртуальный метод OData Balance(Period=…,Condition=…). Без " +
      "указания периода возвращает текущие остатки.",
      getAccumulationBalanceSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetAccumulationBalance(params) }],
      })),
    );
  }

  if (modules.has("reports")) {
    server.tool(
      "get_report",
      "Получение отчёта 1С через произвольный URL HTTP-сервиса (/hs/...).",
      getReportSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetReport(params) }],
      })),
    );
  }

  if (modules.has("odata")) {
    server.tool(
      "odata_query",
      "Произвольный запрос OData 3.0 к любой сущности 1С. Поддерживает $filter, $select, $expand, " +
      "$orderby, $top, $skip, $inlinecount.",
      odataQuerySchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleODataQuery(params) }],
      })),
    );
  }

  if (modules.has("constants")) {
    server.tool(
      "get_constant",
      "Чтение значения константы 1С (Constant_*).",
      getConstantSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetConstant(params) }],
      })),
    );

    server.tool(
      "set_constant",
      "Запись значения константы 1С через OData PATCH (поле Value).",
      setConstantSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleSetConstant(params) }],
      })),
    );
  }

  if (modules.has("accounting")) {
    server.tool(
      "get_accounting_register",
      "Чтение записей регистра бухгалтерии (AccountingRegister_*, например Хозрасчетный — проводки) " +
      "через OData.",
      getAccountingRegisterSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetAccountingRegister(params) }],
      })),
    );

    server.tool(
      "get_accounting_balance",
      "Виртуальные таблицы регистра бухгалтерии (AccountingRegister_*): Balance / Turnovers / " +
      "BalanceAndTurnovers / RecordsWithExtDimensions / ExtDimensions. Не путать с " +
      "get_accumulation_balance — тот работает с AccumulationRegister_*, а этот с двойной записью " +
      "(счета, субконто).",
      getAccountingBalanceSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetAccountingBalance(params) }],
      })),
    );
  }

  if (modules.has("shortcuts")) {
    server.tool(
      "find_by_description",
      "Нечёткий поиск элементов по подстроке наименования (OData substringof по полю Description).",
      findByDescriptionSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleFindByDescription(params) }],
      })),
    );

    server.tool(
      "get_by_key",
      "Получение одной записи 1С по её Ref_Key (GUID).",
      getByKeySchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetByKey(params) }],
      })),
    );

    server.tool(
      "count_entities",
      "Подсчёт количества записей сущности ($inlinecount, $top=0) с необязательным отбором.",
      countEntitiesSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleCountEntities(params) }],
      })),
    );

    server.tool(
      "set_deletion_mark",
      "Установка или снятие пометки на удаление (DeletionMark) у элемента справочника или документа — " +
      "обратимое удаление.",
      setDeletionMarkSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleSetDeletionMark(params) }],
      })),
    );

    server.tool(
      "get_recent_documents",
      "Последние документы указанного вида, отсортированные по дате по убыванию (при необходимости — " +
      "только проведённые).",
      getRecentDocumentsSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleGetRecentDocuments(params) }],
      })),
    );
  }

  if (modules.has("batch")) {
    server.tool(
      "batch_create_documents",
      "Параллельное создание N документов 1С (от 1 до 100 за вызов). 1С не поддерживает OData $batch " +
      "— пакет собирается на стороне клиента, с ограничением параллелизма и отчётом об успехе или " +
      "ошибке по каждой позиции.",
      batchCreateDocumentsSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleBatchCreateDocuments(params) }],
      })),
    );

    server.tool(
      "batch_update_catalog_items",
      "Параллельное изменение N элементов справочников (от 1 до 100). Каждый элемент правится через " +
      "OData PATCH по своему Ref_Key. По каждой позиции отдельно сообщается успех или ошибка; отказ " +
      "части позиций не прерывает пакет.",
      batchUpdateCatalogItemsSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleBatchUpdateCatalogItems(params) }],
      })),
    );

    server.tool(
      "batch_query",
      "Параллельное выполнение N запросов OData к 1С (от 1 до 50). Результат по каждому запросу " +
      "возвращается отдельно. Соединения на стороне сервера нет (1С не поддерживает $batch) — " +
      "объединять результаты нужно на стороне клиента.",
      batchQuerySchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleBatchQuery(params) }],
      })),
    );
  }

  if (modules.has("changes")) {
    server.tool(
      "poll_changes_since",
      "Опрос сущности 1С на предмет строк, изменённых после указанной отметки времени. 1С не " +
      "поддерживает webhooks — вызывать по расписанию (каждые 30–300 с). Возвращает строки и " +
      "`next_cursor` для следующего опроса.",
      pollChangesSinceSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handlePollChangesSince(params) }],
      })),
    );

    server.tool(
      "list_subscriptions",
      "Фиксирует, что 1С не поддерживает подписку на события через webhooks. Возвращает пустой список " +
      "и подсказку обходного пути (использовать poll_changes_since). Нужен, чтобы модель не " +
      "выдумывала несуществующие сценарии подписки.",
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
      "Одобрение ОДНОЙ отложенной операции записи в 1С по значению op_hash из её предпросмотра. " +
      "Одобрение одноразовое и с ограниченным сроком: после него нужно повторить тот же самый вызов " +
      "инструмента записи, чтобы операция выполнилась. Вызывать только после явного согласия человека " +
      "— никогда не одобрять собственный предпросмотр без участия пользователя.",
      approveWriteSchema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handleApproveWrite(params) }],
      })),
    );

    server.tool(
      "rollback_write",
      "Отмена уже выполненной обратимой записи по токену отката из её результата (проведение → отмена " +
      "проведения, отмена → проведение, изменение полей → восстановление прежних значений, снятие или " +
      "установка DeletionMark). Действует один раз. У физического удаления и создания записи токена " +
      "отката нет — эти операции необратимы.",
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
