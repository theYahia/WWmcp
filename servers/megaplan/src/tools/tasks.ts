import { z } from "zod";
import { megaplanGet, megaplanPost } from "../client.js";

export const getTasksSchema = z.object({
  filter_status: z.string().optional().describe("Filter by status (e.g. active, completed, delayed)"),
  filter_responsible_id: z.string().optional().describe("Filter by responsible employee ID"),
  search: z.string().optional().describe("Search by task name"),
  limit: z.number().int().min(1).max(100).default(25).describe("Results per page"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});

export async function handleGetTasks(params: z.infer<typeof getTasksSchema>): Promise<string> {
  const query: Record<string, string> = {
    limit: String(params.limit),
    offset: String(params.offset),
  };
  if (params.filter_status) query["filter[status]"] = params.filter_status;
  if (params.filter_responsible_id) query["filter[responsible]"] = params.filter_responsible_id;
  if (params.search) query["search"] = params.search;

  const result = await megaplanGet("/task", query);
  return JSON.stringify(result, null, 2);
}

export const createTaskSchema = z.object({
  name: z.string().describe("Task name/title"),
  description: z.string().optional().describe("Task description"),
  responsible_id: z.string().describe("Responsible employee ID"),
  deadline: z.string().optional().describe("Deadline in ISO format (e.g. 2025-12-31T23:59:59+03:00)"),
  parent_id: z.string().optional().describe("Parent task ID (for subtasks)"),
});

export async function handleCreateTask(params: z.infer<typeof createTaskSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    contentType: "Task",
    name: params.name,
    responsible: { id: params.responsible_id, contentType: "Employee" },
  };
  if (params.description) body.description = params.description;
  if (params.deadline) body.deadline = params.deadline;
  if (params.parent_id) body.parent = { id: params.parent_id, contentType: "Task" };

  const result = await megaplanPost("/task", body);
  return JSON.stringify(result, null, 2);
}
