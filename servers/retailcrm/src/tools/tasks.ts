import { z } from "zod";
import { retailCrmGet, retailCrmPost } from "../client.js";
import { ok, runTool, type ToolResult } from "../format/index.js";
import { siteField, pageField, limitField } from "./common.js";

// ── tasks_list ───────────────────────────────────────────────
export const tasksListSchema = z.object({
  filter_status: z.enum(["completed", "performing", "not_completed"]).optional().describe("Filter by completion status"),
  filter_performer_id: z.number().int().optional().describe("Filter by assigned manager ID"),
  filter_customer: z.string().optional().describe("Filter by customer name/contact (text match — RetailCRM v5 has no numeric customer-ID task filter)"),
  page: pageField,
  limit: limitField,
});

export async function handleTasksList(params: z.infer<typeof tasksListSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const query: Record<string, string> = { page: String(params.page), limit: String(params.limit) };
    if (params.filter_status) query["filter[status]"] = params.filter_status;
    if (params.filter_performer_id !== undefined) query["filter[performers][]"] = String(params.filter_performer_id);
    if (params.filter_customer) query["filter[customer]"] = params.filter_customer;
    const result = await retailCrmGet("/tasks", query);
    return ok(result);
  });
}

// ── tasks_create ─────────────────────────────────────────────
export const tasksCreateSchema = z.object({
  text: z.string().describe("Task text / what to do"),
  commentary: z.string().optional().describe("Additional commentary"),
  datetime: z.string().optional().describe("Due datetime 'YYYY-MM-DD HH:MM:SS'"),
  performer_id: z.number().int().optional().describe("Assign to manager ID"),
  order_id: z.number().int().optional().describe("Link to order RetailCRM ID"),
  customer_id: z.number().int().optional().describe("Link to customer RetailCRM ID"),
  site: siteField,
});

export async function handleTasksCreate(params: z.infer<typeof tasksCreateSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const task: Record<string, unknown> = { text: params.text };
    if (params.commentary) task.commentary = params.commentary;
    if (params.datetime) task.datetime = params.datetime;
    if (params.performer_id !== undefined) task.performerId = params.performer_id;
    if (params.order_id !== undefined) task.order = { id: params.order_id };
    if (params.customer_id !== undefined) task.customer = { id: params.customer_id };
    const form: Record<string, string> = { task: JSON.stringify(task) };
    if (params.site) form.site = params.site;
    const result = await retailCrmPost("/tasks/create", form);
    return ok(result);
  });
}

// ── tasks_edit ───────────────────────────────────────────────
export const tasksEditSchema = z.object({
  id: z.number().int().describe("Task ID to edit"),
  text: z.string().optional().describe("Updated task text"),
  commentary: z.string().optional().describe("Updated commentary"),
  datetime: z.string().optional().describe("Updated due datetime 'YYYY-MM-DD HH:MM:SS'"),
  performer_id: z.number().int().optional().describe("Reassign to manager ID"),
  complete: z.boolean().optional().describe("Mark the task completed"),
  site: siteField,
});

export async function handleTasksEdit(params: z.infer<typeof tasksEditSchema>): Promise<ToolResult> {
  return runTool(async () => {
    const task: Record<string, unknown> = { id: params.id };
    if (params.text) task.text = params.text;
    if (params.commentary) task.commentary = params.commentary;
    if (params.datetime) task.datetime = params.datetime;
    if (params.performer_id !== undefined) task.performerId = params.performer_id;
    if (params.complete !== undefined) task.complete = params.complete;
    const form: Record<string, string> = { task: JSON.stringify(task) };
    if (params.site) form.site = params.site;
    const result = await retailCrmPost(`/tasks/${params.id}/edit`, form);
    return ok(result);
  });
}
