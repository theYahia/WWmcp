import { z } from "zod";
import { megaplanGet, megaplanPost } from "../client.js";
import { buildListQuery, toDateTime, idSchema } from "../query.js";
import { formatList, formatEntity, formatTask } from "../format.js";

const statusFilter = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .describe('Filter by status code(s), e.g. ["filter_any"]. Codes are account-specific.');

export const getTasksSchema = z.object({
  filter_status: statusFilter,
  filter_responsible_id: z.string().optional().describe("Filter by responsible employee ID"),
  search: z.string().optional().describe("Free-text search by task name"),
  limit: z.number().int().min(1).max(100).default(25).describe("Results per page (max 100)"),
  page_after: z.string().optional().describe("Cursor: id of the last task from the previous page"),
  raw: z.boolean().optional().describe("Return raw API JSON instead of a compact summary"),
});

export async function handleGetTasks(params: z.infer<typeof getTasksSchema>): Promise<string> {
  const query = buildListQuery({
    entity: "Task",
    limit: params.limit,
    pageAfter: params.page_after,
    status: params.filter_status,
    refs: params.filter_responsible_id
      ? [{ field: "responsible", contentType: "Employee", id: params.filter_responsible_id }]
      : [],
    search: params.search,
  });
  const result = await megaplanGet("/task", query);
  return formatList(result, formatTask, params.raw);
}

export const getTaskSchema = z.object({
  id: idSchema.describe("Task ID"),
  raw: z.boolean().optional().describe("Return raw API JSON instead of a compact summary"),
});

export async function handleGetTask(params: z.infer<typeof getTaskSchema>): Promise<string> {
  const result = await megaplanGet(`/task/${params.id}`);
  return formatEntity(result, formatTask, params.raw);
}

export const createTaskSchema = z.object({
  name: z.string().describe("Task name/title"),
  description: z.string().optional().describe("Task description"),
  responsible_id: z.string().describe("Responsible employee ID"),
  deadline: z.string().optional().describe("Deadline as ISO 8601, e.g. 2025-12-31T23:59:59+03:00"),
  parent_id: z.string().optional().describe("Parent ID (for a subtask or a project task)"),
  parent_type: z.enum(["Task", "Project"]).default("Task").describe("Parent entity type"),
});

export async function handleCreateTask(params: z.infer<typeof createTaskSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    contentType: "Task",
    name: params.name,
    responsible: { id: params.responsible_id, contentType: "Employee" },
  };
  // TODO(live-verify): the task body field may be "statement"/"subject" rather than "description".
  if (params.description) body.description = params.description;
  if (params.deadline) body.deadline = toDateTime(params.deadline);
  if (params.parent_id) body.parent = { id: params.parent_id, contentType: params.parent_type };

  const result = await megaplanPost("/task", body);
  return formatEntity(result, formatTask);
}

export const updateTaskSchema = z.object({
  id: idSchema.describe("Task ID to update"),
  name: z.string().optional().describe("New name/title"),
  description: z.string().optional().describe("New description"),
  responsible_id: z.string().optional().describe("New responsible employee ID"),
  deadline: z.string().optional().describe("New deadline as ISO 8601"),
  status: z.string().optional().describe("New status code (experimental — field shape unverified)"),
});

export async function handleUpdateTask(params: z.infer<typeof updateTaskSchema>): Promise<string> {
  const body: Record<string, unknown> = { contentType: "Task" };
  if (params.name !== undefined) body.name = params.name;
  if (params.description !== undefined) body.description = params.description;
  if (params.responsible_id) body.responsible = { id: params.responsible_id, contentType: "Employee" };
  if (params.deadline) body.deadline = toDateTime(params.deadline);
  // TODO(live-verify): status may need a link-entity rather than a bare code.
  if (params.status !== undefined) body.status = params.status;

  // v3 updates are POST to /{entity}/{id} (not PATCH).
  const result = await megaplanPost(`/task/${params.id}`, body);
  return formatEntity(result, formatTask);
}
