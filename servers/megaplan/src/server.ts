/**
 * Megaplan MCP server factory.
 * Split from index.ts so tests can import without triggering runServer.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
import { getTasksSchema, handleGetTasks, createTaskSchema, handleCreateTask } from "./tools/tasks.js";
import { getDealsSchema, handleGetDeals, createDealSchema, handleCreateDeal } from "./tools/deals.js";
import { getProjectsSchema, handleGetProjects } from "./tools/projects.js";
import { getEmployeesSchema, handleGetEmployees } from "./tools/employees.js";
import { getCommentsSchema, handleGetComments, createCommentSchema, handleCreateComment } from "./tools/comments.js";

export const logger = createLogger("megaplan-mcp");

export const TOOL_COUNT = 8;

export function createServer(): McpServer {
  const server = new McpServer({
    name: "megaplan-mcp",
    version: "2.0.0",
  });

  // ── Tasks ──
  server.tool(
    "get_tasks",
    "List Megaplan tasks with filters by status (active/completed/delayed), responsible user, or search term.",
    getTasksSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetTasks(params) }],
    })),
  );

  server.tool(
    "create_task",
    "Create a new Megaplan task — name, description, responsible user, deadline.",
    createTaskSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateTask(params) }],
    })),
  );

  // ── Deals ──
  server.tool(
    "get_deals",
    "List Megaplan deals with filters by status, responsible user, or search.",
    getDealsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetDeals(params) }],
    })),
  );

  server.tool(
    "create_deal",
    "Create a new Megaplan deal — name, pipeline (program), responsible user, amount.",
    createDealSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateDeal(params) }],
    })),
  );

  // ── Projects ──
  server.tool(
    "get_projects",
    "List Megaplan projects with filters by status and search.",
    getProjectsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetProjects(params) }],
    })),
  );

  // ── Employees ──
  server.tool(
    "get_employees",
    "List Megaplan employees with search and department filter.",
    getEmployeesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetEmployees(params) }],
    })),
  );

  // ── Comments ──
  server.tool(
    "get_comments",
    "List comments for a task, deal, or project in Megaplan.",
    getCommentsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetComments(params) }],
    })),
  );

  server.tool(
    "create_comment",
    "Add a comment to a task, deal, or project in Megaplan.",
    createCommentSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateComment(params) }],
    })),
  );

  // ── Skills (MCP prompts) — preserved from v1 ──
  server.prompt(
    "my-tasks-today",
    "Мои задачи на сегодня — shows your tasks due today or overdue",
    {},
    async () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: "Используй get_tasks с filter_status='active' чтобы получить мои активные задачи. Покажи список задач с дедлайнами, отсортируй по срочности. Если задача просрочена — отметь. Формат: компактная таблица с колонками: Задача, Дедлайн, Статус, Приоритет.",
          },
        },
      ],
    }),
  );

  server.prompt(
    "create-deal-wizard",
    "Создай сделку — guided deal creation wizard",
    {},
    async () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: "Помоги создать новую сделку в Мегаплане. Спроси у меня: 1) Название сделки, 2) ID программы (pipeline), 3) Ответственный (опционально), 4) Сумма (опционально), 5) Описание (опционально). После сбора данных вызови create_deal.",
          },
        },
      ],
    }),
  );

  return server;
}
