/**
 * Planfix MCP server factory — tool + prompt registration.
 *
 * 20 tools + 2 MCP prompts: tasks, contacts, projects, comments, users,
 * directories, custom fields, datatags, files.
 *
 * Auth: PLANFIX_ACCOUNT (subdomain) + PLANFIX_API_KEY (or legacy PLANFIX_TOKEN).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";

import { getTasksSchema, handleGetTasks, getTaskSchema, handleGetTask, createTaskSchema, handleCreateTask, updateTaskSchema, handleUpdateTask } from "./tools/tasks.js";
import { getContactsSchema, handleGetContacts, getContactSchema, handleGetContact, createContactSchema, handleCreateContact, updateContactSchema, handleUpdateContact } from "./tools/contacts.js";
import { getProjectsSchema, handleGetProjects, getProjectSchema, handleGetProject } from "./tools/projects.js";
import { getCommentsSchema, handleGetComments, addCommentSchema, handleAddComment } from "./tools/comments.js";
import { listUsersSchema, handleListUsers, getUserSchema, handleGetUser } from "./tools/users.js";
import { listDirectoriesSchema, handleListDirectories, listDirectoryEntriesSchema, handleListDirectoryEntries } from "./tools/directories.js";
import { listCustomFieldsSchema, handleListCustomFields } from "./tools/customfields.js";
import { listDatatagsSchema, handleListDatatags } from "./tools/datatags.js";
import { uploadFileFromUrlSchema, handleUploadFileFromUrl, getFileSchema, handleGetFile } from "./tools/files.js";
import { skillMyTasks, skillCreateTask } from "./skills.js";

export const VERSION = "1.2.0";
export const TOOL_COUNT = 20;

export const logger = createLogger("planfix-mcp");

export function createPlanfixServer(): McpServer {
  const server = new McpServer({
    name: "planfix-mcp",
    version: VERSION,
  });

  server.tool(
    "get_tasks",
    "Получить список задач из Planfix с пагинацией и фильтрами.",
    getTasksSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleGetTasks(params) }] })),
  );

  server.tool(
    "get_task",
    "Получить одну задачу по ID.",
    getTaskSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleGetTask(params) }] })),
  );

  server.tool(
    "create_task",
    "Создать новую задачу в Planfix.",
    createTaskSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleCreateTask(params) }] })),
  );

  server.tool(
    "update_task",
    "Обновить существующую задачу в Planfix (название, описание, статус, исполнитель).",
    updateTaskSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleUpdateTask(params) }] })),
  );

  server.tool(
    "get_contacts",
    "Получить список контактов из Planfix с пагинацией и фильтрами.",
    getContactsSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleGetContacts(params) }] })),
  );

  server.tool(
    "get_contact",
    "Получить одного контакта по ID.",
    getContactSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleGetContact(params) }] })),
  );

  server.tool(
    "get_projects",
    "Получить список проектов из Planfix.",
    getProjectsSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleGetProjects(params) }] })),
  );

  server.tool(
    "get_project",
    "Получить один проект по ID.",
    getProjectSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleGetProject(params) }] })),
  );

  server.tool(
    "get_comments",
    "Получить комментарии к задаче.",
    getCommentsSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleGetComments(params) }] })),
  );

  server.tool(
    "add_comment",
    "Добавить комментарий к задаче.",
    addCommentSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleAddComment(params) }] })),
  );

  server.tool(
    "create_contact",
    "Создать контакт (или компанию) в Planfix.",
    createContactSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleCreateContact(params) }] })),
  );

  server.tool(
    "update_contact",
    "Обновить контакт (имя, email, телефон).",
    updateContactSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleUpdateContact(params) }] })),
  );

  server.tool(
    "list_users",
    "Получить список сотрудников Planfix. Используй для поиска ID исполнителя по имени перед create_task/update_task.",
    listUsersSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleListUsers(params) }] })),
  );

  server.tool(
    "get_user",
    "Получить одного сотрудника по ID.",
    getUserSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleGetUser(params) }] })),
  );

  server.tool(
    "list_directories",
    "Получить список справочников Planfix (в т.ч. наборы статусов задач хранятся как справочники).",
    listDirectoriesSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleListDirectories(params) }] })),
  );

  server.tool(
    "list_directory_entries",
    "Получить записи справочника по его ID (например, варианты статусов).",
    listDirectoryEntriesSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleListDirectoryEntries(params) }] })),
  );

  server.tool(
    "list_custom_fields",
    "Получить список кастомных полей для типа объекта (task/contact/project/user/main).",
    listCustomFieldsSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleListCustomFields(params) }] })),
  );

  server.tool(
    "list_datatags",
    "Получить список дата-тегов Planfix.",
    listDatatagsSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleListDatatags(params) }] })),
  );

  server.tool(
    "upload_file_from_url",
    "Загрузить файл в Planfix по прямой ссылке (без multipart).",
    uploadFileFromUrlSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleUploadFileFromUrl(params) }] })),
  );

  server.tool(
    "get_file",
    "Получить метаданные файла по ID.",
    getFileSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleGetFile(params) }] })),
  );

  skillMyTasks(server);
  skillCreateTask(server);

  return server;
}
