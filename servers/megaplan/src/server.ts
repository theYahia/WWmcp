/**
 * Megaplan MCP server factory.
 * Split from index.ts so tests can import without triggering runServer.
 */

import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ZodRawShape } from "zod";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
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
import { getDealProgramsSchema, handleGetDealPrograms, getDealProgramSchema, handleGetDealProgram } from "./tools/programs.js";
import { listClientsSchema, handleListClients, getClientSchema, handleGetClient } from "./tools/contractors.js";
import { getCurrentUserSchema, handleGetCurrentUser } from "./tools/me.js";
import { MY_TASKS_TODAY, CREATE_DEAL_WIZARD, type PromptDef } from "./prompts.js";

export const logger = createLogger("megaplan-mcp");

export const TOOL_COUNT = 18;
export const PROMPT_COUNT = 2;

/** Single source of truth for the advertised version — no hardcoded drift. */
export const VERSION = (
  JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
    version: string;
  }
).version;

export function createServer(): McpServer {
  const server = new McpServer({
    name: "megaplan-mcp",
    version: VERSION,
  });

  /** Every tool returns a JSON string; wrap it in the MCP text result + error handling. */
  const tool = <P>(
    name: string,
    description: string,
    shape: ZodRawShape,
    handler: (params: P) => Promise<string>,
  ) =>
    server.tool(
      name,
      description,
      shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await handler(params as P) }],
      })),
    );

  // ── Tasks ──
  tool("get_tasks", "List tasks from Megaplan, filtered by status code(s), responsible user, and free-text search.", getTasksSchema.shape, handleGetTasks);
  tool("get_task", "Get a single Megaplan task by ID with full details.", getTaskSchema.shape, handleGetTask);
  tool("create_task", "Create a task in Megaplan with name, description, responsible user, and deadline.", createTaskSchema.shape, handleCreateTask);
  tool("update_task", "Update an existing Megaplan task (name, description, responsible, deadline, status).", updateTaskSchema.shape, handleUpdateTask);

  // ── Deals ──
  tool("get_deals", "List deals from Megaplan, filtered by status code(s), responsible user, and free-text search.", getDealsSchema.shape, handleGetDeals);
  tool("get_deal", "Get a single Megaplan deal by ID with full details.", getDealSchema.shape, handleGetDeal);
  tool("create_deal", "Create a deal in Megaplan. Requires a program (pipeline) ID — discover it via get_deal_programs.", createDealSchema.shape, handleCreateDeal);
  tool("update_deal", "Update an existing Megaplan deal (name, responsible, amount, description, status).", updateDealSchema.shape, handleUpdateDeal);

  // ── Projects ──
  tool("get_projects", "List projects from Megaplan, filtered by status code(s) and free-text search.", getProjectsSchema.shape, handleGetProjects);
  tool("get_project", "Get a single Megaplan project by ID with full details.", getProjectSchema.shape, handleGetProject);

  // ── Employees ──
  tool("get_employees", "List employees from Megaplan with free-text search and department filter.", getEmployeesSchema.shape, handleGetEmployees);

  // ── Deal programs (pipelines) ──
  tool("get_deal_programs", "List deal programs (pipelines). Use this to find the program_id required by create_deal.", getDealProgramsSchema.shape, handleGetDealPrograms);
  tool("get_deal_program", "Get a single deal program (pipeline) by ID.", getDealProgramSchema.shape, handleGetDealProgram);

  // ── Clients (CRM contractors) ──
  tool("list_clients", "List clients (CRM contractors): people (human) or organizations (company).", listClientsSchema.shape, handleListClients);
  tool("get_client", "Get a single client (contractor) by type and ID.", getClientSchema.shape, handleGetClient);

  // ── Current user ──
  tool("get_current_user", "Get the authenticated user's employee record (experimental). Use it to scope 'my tasks'.", getCurrentUserSchema.shape, handleGetCurrentUser);

  // ── Comments ──
  tool("get_comments", "List comments for a task, deal, or project in Megaplan.", getCommentsSchema.shape, handleGetComments);
  tool("create_comment", "Add a comment to a task, deal, or project in Megaplan.", createCommentSchema.shape, handleCreateComment);

  // ── Skills (MCP prompts) ──
  const registerPrompt = (p: PromptDef) =>
    server.prompt(p.name, p.description, {}, async () => ({
      messages: [{ role: "user" as const, content: { type: "text" as const, text: p.text } }],
    }));
  registerPrompt(MY_TASKS_TODAY);
  registerPrompt(CREATE_DEAL_WIZARD);

  return server;
}
