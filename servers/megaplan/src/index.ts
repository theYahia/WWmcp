#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { fileURLToPath } from "node:url";
import { realpathSync } from "node:fs";
import { TOOL_COUNT, PROMPT_COUNT } from "./meta.js";
import {
  getTasksSchema, handleGetTasks,
  getTaskSchema, handleGetTask,
  createTaskSchema, handleCreateTask,
  updateTaskSchema, handleUpdateTask,
} from "./tools/tasks.js";
import {
  getDealsSchema, handleGetDeals,
  getDealSchema, handleGetDeal,
  createDealSchema, handleCreateDeal,
  updateDealSchema, handleUpdateDeal,
} from "./tools/deals.js";
import { getProjectsSchema, handleGetProjects, getProjectSchema, handleGetProject } from "./tools/projects.js";
import { getEmployeesSchema, handleGetEmployees } from "./tools/employees.js";
import { getCommentsSchema, handleGetComments, createCommentSchema, handleCreateComment } from "./tools/comments.js";
import {
  getDealProgramsSchema, handleGetDealPrograms,
  getDealProgramSchema, handleGetDealProgram,
} from "./tools/programs.js";
import {
  listClientsSchema, handleListClients,
  getClientSchema, handleGetClient,
} from "./tools/contractors.js";
import { getCurrentUserSchema, handleGetCurrentUser } from "./tools/me.js";
import { MY_TASKS_TODAY, CREATE_DEAL_WIZARD, type PromptDef } from "./prompts.js";

type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

/** Wrap a tool handler so thrown errors become a clean isError result, not a transport error. */
function wrapTool<P>(handler: (params: P) => Promise<string>) {
  return async (params: P): Promise<ToolResult> => {
    try {
      return { content: [{ type: "text", text: await handler(params) }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[megaplan-mcp] tool error:", error);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  };
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: "megaplan-mcp",
    version: "4.0.0",
  });

  // ── Tasks ──
  server.tool("get_tasks", "List tasks from Megaplan, filtered by status code(s), responsible user, and free-text search.", getTasksSchema.shape, wrapTool(handleGetTasks));
  server.tool("get_task", "Get a single Megaplan task by ID with full details.", getTaskSchema.shape, wrapTool(handleGetTask));
  server.tool("create_task", "Create a task in Megaplan with name, description, responsible user, and deadline.", createTaskSchema.shape, wrapTool(handleCreateTask));
  server.tool("update_task", "Update an existing Megaplan task (name, description, responsible, deadline, status).", updateTaskSchema.shape, wrapTool(handleUpdateTask));

  // ── Deals ──
  server.tool("get_deals", "List deals from Megaplan, filtered by status code(s), responsible user, and free-text search.", getDealsSchema.shape, wrapTool(handleGetDeals));
  server.tool("get_deal", "Get a single Megaplan deal by ID with full details.", getDealSchema.shape, wrapTool(handleGetDeal));
  server.tool("create_deal", "Create a deal in Megaplan. Requires a program (pipeline) ID — discover it via get_deal_programs.", createDealSchema.shape, wrapTool(handleCreateDeal));
  server.tool("update_deal", "Update an existing Megaplan deal (name, responsible, amount, description, status).", updateDealSchema.shape, wrapTool(handleUpdateDeal));

  // ── Projects ──
  server.tool("get_projects", "List projects from Megaplan, filtered by status code(s) and free-text search.", getProjectsSchema.shape, wrapTool(handleGetProjects));
  server.tool("get_project", "Get a single Megaplan project by ID with full details.", getProjectSchema.shape, wrapTool(handleGetProject));

  // ── Employees ──
  server.tool("get_employees", "List employees from Megaplan with free-text search and department filter.", getEmployeesSchema.shape, wrapTool(handleGetEmployees));

  // ── Deal programs (pipelines) ──
  server.tool("get_deal_programs", "List deal programs (pipelines). Use this to find the program_id required by create_deal.", getDealProgramsSchema.shape, wrapTool(handleGetDealPrograms));
  server.tool("get_deal_program", "Get a single deal program (pipeline) by ID.", getDealProgramSchema.shape, wrapTool(handleGetDealProgram));

  // ── Clients (CRM contractors) ──
  server.tool("list_clients", "List clients (CRM contractors): people (human) or organizations (company).", listClientsSchema.shape, wrapTool(handleListClients));
  server.tool("get_client", "Get a single client (contractor) by type and ID.", getClientSchema.shape, wrapTool(handleGetClient));

  // ── Current user ──
  server.tool("get_current_user", "Get the authenticated user's employee record (experimental). Use it to scope 'my tasks'.", getCurrentUserSchema.shape, wrapTool(handleGetCurrentUser));

  // ── Comments ──
  server.tool("get_comments", "List comments for a task, deal, or project in Megaplan.", getCommentsSchema.shape, wrapTool(handleGetComments));
  server.tool("create_comment", "Add a comment to a task, deal, or project in Megaplan.", createCommentSchema.shape, wrapTool(handleCreateComment));

  // ── Skills (prompts) ──
  const registerPrompt = (p: PromptDef) =>
    server.prompt(p.name, p.description, {}, async () => ({
      messages: [{ role: "user" as const, content: { type: "text" as const, text: p.text } }],
    }));
  registerPrompt(MY_TASKS_TODAY);
  registerPrompt(CREATE_DEAL_WIZARD);

  return server;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--http")) {
    const { startHttpServer } = await import("./http.js");
    const port = parseInt(process.env.PORT ?? "3000", 10);
    await startHttpServer(createServer, port);
  } else {
    const server = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`[megaplan-mcp] Server started via stdio. ${TOOL_COUNT} tools, ${PROMPT_COUNT} skills available.`);
  }
}

/** True when this file is being executed directly (not imported, e.g. by tests). */
function isEntrypoint(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isEntrypoint()) {
  main().catch((error) => {
    console.error("[megaplan-mcp] Error:", error);
    process.exit(1);
  });
}
