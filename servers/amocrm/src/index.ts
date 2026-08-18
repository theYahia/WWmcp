#!/usr/bin/env node

/**
 * @theyahia/amocrm-mcp — MCP server for the amoCRM API
 *
 * 19 tools: leads, contacts, companies, pipelines, tasks, unsorted,
 * notes, search, events, account.
 * Auth: OAuth 2.0 Bearer token with automatic refresh on 401.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";

import { listLeadsSchema, handleListLeads, getLeadSchema, handleGetLead, createLeadSchema, handleCreateLead, updateLeadSchema, handleUpdateLead } from "./tools/leads.js";
import { listContactsSchema, handleListContacts, getContactSchema, handleGetContact, createContactSchema, handleCreateContact } from "./tools/contacts.js";
import { listCompaniesSchema, handleListCompanies, createCompanySchema, handleCreateCompany } from "./tools/companies.js";
import { listPipelinesSchema, handleListPipelines } from "./tools/pipelines.js";
import { listTasksSchema, handleListTasks, createTaskSchema, handleCreateTask, completeTaskSchema, handleCompleteTask } from "./tools/tasks.js";
import { listUnsortedSchema, handleListUnsorted, acceptUnsortedSchema, handleAcceptUnsorted } from "./tools/unsorted.js";
import { listEventsSchema, handleListEvents } from "./tools/events.js";
import { getAccountSchema, handleGetAccount } from "./tools/account.js";
import { addNoteSchema, handleAddNote } from "./tools/notes.js";
import { searchSchema, handleSearch } from "./tools/search.js";

const logger = createLogger("amocrm-mcp");

function createServer(): McpServer {
  const server = new McpServer({
    name: "amocrm-mcp",
    version: "2.0.2",
  });

  // --- Leads (4 tools) ---

  server.tool(
    "list_leads",
    "Search and list deals (leads) in amoCRM. Supports filtering by pipeline, statuses, and full-text search. Use 'with' to embed contacts or loss reasons.",
    listLeadsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListLeads(params) }],
    })),
  );

  server.tool(
    "get_lead",
    "Get a single lead by ID with full details. Use 'with' to include linked contacts and catalog elements.",
    getLeadSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetLead(params) }],
    })),
  );

  server.tool(
    "create_lead",
    "Create a new lead (deal) in amoCRM. Requires a name. Optionally set price, pipeline, status, responsible user, and custom fields.",
    createLeadSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateLead(params) }],
    })),
  );

  server.tool(
    "update_lead",
    "Update an existing lead — change name, price, status, pipeline, responsible user, or custom fields. Useful for moving deals between stages.",
    updateLeadSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleUpdateLead(params) }],
    })),
  );

  // --- Contacts (3 tools) ---

  server.tool(
    "list_contacts",
    "Search and list contacts in amoCRM. Supports full-text search across name, phone, and email.",
    listContactsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListContacts(params) }],
    })),
  );

  server.tool(
    "get_contact",
    "Get a single contact by ID with full details including custom fields (phone, email, etc.).",
    getContactSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetContact(params) }],
    })),
  );

  server.tool(
    "create_contact",
    "Create a new contact in amoCRM. Use custom_fields_values to set phone, email, and other fields.",
    createContactSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateContact(params) }],
    })),
  );

  // --- Companies (2 tools) ---

  server.tool(
    "list_companies",
    "Search and list companies in amoCRM. Use 'with' to embed linked leads and contacts.",
    listCompaniesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListCompanies(params) }],
    })),
  );

  server.tool(
    "create_company",
    "Create a new company in amoCRM. Use custom_fields_values for address, website, etc.",
    createCompanySchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateCompany(params) }],
    })),
  );

  // --- Pipelines (1 tool) ---

  server.tool(
    "list_pipelines",
    "List all sales pipelines with their statuses (stages). Essential for understanding the sales funnel structure before creating or filtering leads.",
    listPipelinesSchema.shape,
    withErrorHandling(async () => ({
      content: [{ type: "text", text: await handleListPipelines() }],
    })),
  );

  // --- Tasks (3 tools) ---

  server.tool(
    "list_tasks",
    "List tasks in amoCRM. Filter by entity (lead/contact/company), completion status, or responsible user.",
    listTasksSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListTasks(params) }],
    })),
  );

  server.tool(
    "create_task",
    "Create a task linked to a lead, contact, or company. Set deadline (complete_till as Unix timestamp) and task type (1=Call, 2=Meeting, 3=Email).",
    createTaskSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCreateTask(params) }],
    })),
  );

  server.tool(
    "complete_task",
    "Mark a task as completed and add a result text. The result will appear in the entity activity feed.",
    completeTaskSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleCompleteTask(params) }],
    })),
  );

  // --- Unsorted (2 tools) ---

  server.tool(
    "list_unsorted",
    "List incoming unsorted leads (from forms, email parsing, etc.) that need to be accepted or declined.",
    listUnsortedSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListUnsorted(params) }],
    })),
  );

  server.tool(
    "accept_unsorted",
    "Accept an unsorted lead — moves it into a pipeline as a real lead. Optionally specify target pipeline, status, and responsible user.",
    acceptUnsortedSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleAcceptUnsorted(params) }],
    })),
  );

  // --- Notes (1 tool) ---

  server.tool(
    "add_note",
    "Add a note to a lead, contact, or company. Supports common notes, incoming/outgoing call logs, and service messages.",
    addNoteSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleAddNote(params) }],
    })),
  );

  // --- Search (1 tool) ---

  server.tool(
    "search",
    "Universal search across amoCRM — finds leads, contacts, and companies matching the query. Min 3 characters.",
    searchSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSearch(params) }],
    })),
  );

  // --- Events (1 tool) ---

  server.tool(
    "list_events",
    "List events (activity log) in amoCRM. Filter by entity type, entity ID, or event type. Shows status changes, calls, notes, and other activities.",
    listEventsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListEvents(params) }],
    })),
  );

  // --- Account (1 tool) ---

  server.tool(
    "get_account",
    "Get current amoCRM account info — name, plan, users, task types, etc. Use 'with' to include users_groups, task_types, and amojo_id.",
    getAccountSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetAccount(params) }],
    })),
  );

  return server;
}

runServer(createServer, {
  name: "amocrm-mcp",
  version: "2.0.2",
  toolCount: 19,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
