import { z } from "zod";
import { apiGet, apiPost, apiPatch } from "../client.js";

// --- list_tasks ---
export const listTasksSchema = z.object({
  page: z.number().optional().describe("Page number (default 1)"),
  limit: z.number().max(250).optional().describe("Items per page (max 250, default 50)"),
  entity_type: z
    .enum(["leads", "contacts", "companies"])
    .optional()
    .describe("Filter by entity type"),
  entity_id: z.number().optional().describe("Filter by entity ID (requires entity_type)"),
  is_completed: z.boolean().optional().describe("Filter by completion status"),
  responsible_user_id: z.number().optional().describe("Filter by responsible user"),
});

export async function handleListTasks(params: z.infer<typeof listTasksSchema>): Promise<string> {
  const qp: Record<string, string> = {};
  if (params.page) qp["page"] = String(params.page);
  if (params.limit) qp["limit"] = String(params.limit);
  if (params.entity_type) qp["filter[entity_type]"] = params.entity_type;
  if (params.entity_id) qp["filter[entity_id]"] = String(params.entity_id);
  if (params.is_completed !== undefined) qp["filter[is_completed]"] = params.is_completed ? "1" : "0";
  if (params.responsible_user_id) qp["filter[responsible_user_id]"] = String(params.responsible_user_id);

  const data = await apiGet<unknown>("/tasks", qp);
  return JSON.stringify(data, null, 2);
}

// --- create_task ---
export const createTaskSchema = z.object({
  text: z.string().describe("Task description text"),
  entity_id: z.number().describe("ID of the linked entity (lead, contact, or company)"),
  entity_type: z.enum(["leads", "contacts", "companies"]).describe("Type of the linked entity"),
  complete_till: z.number().describe("Unix timestamp — deadline for the task"),
  task_type_id: z.number().optional().describe("Task type ID (1=Call, 2=Meeting, 3=Email). Use get_account to see all types."),
  responsible_user_id: z.number().optional().describe("Responsible user ID"),
});

export async function handleCreateTask(params: z.infer<typeof createTaskSchema>): Promise<string> {
  const data = await apiPost<unknown>("/tasks", [params]);
  return JSON.stringify(data, null, 2);
}

// --- complete_task ---
export const completeTaskSchema = z.object({
  task_id: z.number().describe("Task ID to complete"),
  result_text: z.string().describe("Result/comment text for the completed task"),
});

export async function handleCompleteTask(params: z.infer<typeof completeTaskSchema>): Promise<string> {
  const body = {
    is_completed: true,
    result: { text: params.result_text },
  };
  const data = await apiPatch<unknown>(`/tasks/${params.task_id}`, body);
  return JSON.stringify(data, null, 2);
}
