#!/usr/bin/env node

import { pathToFileURL } from "node:url";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { VERSION } from "./version.js";

import {
  getAppItemsSchema, handleGetAppItems,
  getAppItemSchema, handleGetAppItem,
  createItemSchema, handleCreateItem,
  updateAppItemSchema, handleUpdateAppItem,
  setAppItemStatusSchema, handleSetAppItemStatus,
} from "./tools/app-items.js";
import {
  getTasksSchema, handleGetTasks,
  getTaskSchema, handleGetTask,
  getTaskExitsSchema, handleGetTaskExits,
  completeTaskSchema, handleCompleteTask,
  reassignTaskSchema, handleReassignTask,
} from "./tools/tasks.js";
import {
  listProcessesSchema, handleListProcesses,
  getProcessInstancesSchema, handleGetProcessInstances,
  startProcessSchema, handleStartProcess,
} from "./tools/processes.js";
import {
  getUsersSchema, handleGetUsers,
  getUserByIdSchema, handleGetUserById,
} from "./tools/users.js";
import {
  getCommentsSchema, handleGetComments,
  addCommentSchema, handleAddComment,
} from "./tools/comments.js";
import {
  listNamespacesSchema, handleListNamespaces,
  listAppsSchema, handleListApps,
  getAppSchemaSchema, handleGetAppSchema,
} from "./tools/scheme.js";
import { startHttpTransport } from "./transport/http.js";

// Аннотации инструментов (MCP ToolAnnotations). openWorldHint=true — все обращаются к внешнему ELMA365 API.
const READ: ToolAnnotations = { readOnlyHint: true, openWorldHint: true };
const WRITE: ToolAnnotations = { readOnlyHint: false, destructiveHint: false, openWorldHint: true };
const MUTATE: ToolAnnotations = { readOnlyHint: false, destructiveHint: true, openWorldHint: true };

interface ToolDef {
  name: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodObject<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (params: any) => Promise<string>;
  annotations: ToolAnnotations;
}

const TOOLS: ToolDef[] = [
  // --- App items ---
  { name: "get_app_items", description: "Получить список элементов приложения ELMA365 по namespace и code (с фильтрацией и сортировкой).", schema: getAppItemsSchema, handler: handleGetAppItems, annotations: READ },
  { name: "get_app_item", description: "Получить один элемент приложения ELMA365 по namespace, code и id.", schema: getAppItemSchema, handler: handleGetAppItem, annotations: READ },
  { name: "create_item", description: "Создать новый элемент в приложении ELMA365.", schema: createItemSchema, handler: handleCreateItem, annotations: WRITE },
  { name: "update_app_item", description: "Изменить поля существующего элемента приложения ELMA365.", schema: updateAppItemSchema, handler: handleUpdateAppItem, annotations: MUTATE },
  { name: "set_app_item_status", description: "Сменить статус элемента приложения ELMA365.", schema: setAppItemStatusSchema, handler: handleSetAppItemStatus, annotations: MUTATE },

  // --- Tasks ---
  { name: "get_tasks", description: "Получить список BPM-задач ELMA365 (все / входящие / исходящие / в которых участвую).", schema: getTasksSchema, handler: handleGetTasks, annotations: READ },
  { name: "get_task", description: "Получить одну BPM-задачу ELMA365 по ID.", schema: getTaskSchema, handler: handleGetTask, annotations: READ },
  { name: "get_task_exits", description: "Получить доступные исходы (варианты завершения) BPM-задачи ELMA365. Вызывайте перед complete_task.", schema: getTaskExitsSchema, handler: handleGetTaskExits, annotations: READ },
  { name: "complete_task", description: "Завершить (отправить) BPM-задачу ELMA365 по выбранному исходу. exitId берётся из get_task_exits.", schema: completeTaskSchema, handler: handleCompleteTask, annotations: WRITE },
  { name: "reassign_task", description: "Переназначить BPM-задачу ELMA365 другому исполнителю.", schema: reassignTaskSchema, handler: handleReassignTask, annotations: WRITE },

  // --- Processes ---
  { name: "list_processes", description: "Получить список шаблонов бизнес-процессов ELMA365 в разделе (namespace).", schema: listProcessesSchema, handler: handleListProcesses, annotations: READ },
  { name: "get_process_instances", description: "Получить запущенные экземпляры бизнес-процесса ELMA365 по шаблону (namespace + code).", schema: getProcessInstancesSchema, handler: handleGetProcessInstances, annotations: READ },
  { name: "start_process", description: "Запустить бизнес-процесс ELMA365 по namespace и code.", schema: startProcessSchema, handler: handleStartProcess, annotations: WRITE },

  // --- Users ---
  { name: "get_users", description: "Получить список пользователей ELMA365 (с опциональным фильтром).", schema: getUsersSchema, handler: handleGetUsers, annotations: READ },
  { name: "get_user_by_id", description: "Получить пользователя ELMA365 по ID.", schema: getUserByIdSchema, handler: handleGetUserById, annotations: READ },

  // --- Comments (object feed) ---
  { name: "get_comments", description: "Получить комментарии (сообщения ленты) элемента приложения ELMA365.", schema: getCommentsSchema, handler: handleGetComments, annotations: READ },
  { name: "add_comment", description: "Добавить комментарий (сообщение в ленту) к элементу приложения ELMA365.", schema: addCommentSchema, handler: handleAddComment, annotations: WRITE },

  // --- Discovery (scheme) ---
  { name: "list_namespaces", description: "Получить список разделов (namespaces) ELMA365. Используйте для discovery перед чтением/записью.", schema: listNamespacesSchema, handler: handleListNamespaces, annotations: READ },
  { name: "list_apps", description: "Получить список приложений в разделе ELMA365 (namespace).", schema: listAppsSchema, handler: handleListApps, annotations: READ },
  { name: "get_app_schema", description: "Получить схему приложения ELMA365 (коды и типы полей) по namespace и code. Используйте перед create_item/update_app_item.", schema: getAppSchemaSchema, handler: handleGetAppSchema, annotations: READ },
];

export const TOOL_COUNT = TOOLS.length;

export function createServer(): McpServer {
  const server = new McpServer({
    name: "elma365-mcp",
    version: VERSION,
  });

  for (const tool of TOOLS) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.schema.shape,
        annotations: tool.annotations,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (params: any) => {
        try {
          return { content: [{ type: "text" as const, text: await tool.handler(params) }] };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          return { content: [{ type: "text" as const, text: `Ошибка ELMA365: ${message}` }], isError: true };
        }
      },
    );
  }

  return server;
}

async function main() {
  const args = process.argv.slice(2);
  const httpFlag = args.includes("--http");
  const portIndex = args.indexOf("--port");
  const port = portIndex !== -1 ? parseInt(args[portIndex + 1], 10) : 3000;

  const server = createServer();

  if (httpFlag) {
    await startHttpTransport(server, port);
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`[elma365-mcp] Сервер запущен (stdio). ${TOOL_COUNT} инструментов. Требуется ELMA365_DOMAIN + ELMA365_TOKEN.`);
  }
}

// Запускаем сервер только при прямом вызове (node dist/index.js / npx),
// но не при импорте модуля (тесты, инструментальная проверка).
const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entry) {
  main().catch((error) => {
    console.error("[elma365-mcp] Ошибка:", error);
    process.exit(1);
  });
}
