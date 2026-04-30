import { z } from "zod";
import { bitrix24Call } from "../client.js";

export const createTaskSchema = z.object({
  title: z.string().describe("Task title"),
  description: z.string().optional().describe("Task description"),
  responsible_id: z.number().describe("Responsible user ID"),
  deadline: z.string().optional().describe("Deadline in ISO format (e.g. 2025-12-31T23:59:59+03:00)"),
  priority: z.enum(["0", "1", "2"]).default("1").describe("Priority: 0=low, 1=normal, 2=high"),
  group_id: z.number().optional().describe("Project/group ID"),
});

export async function handleCreateTask(params: z.infer<typeof createTaskSchema>): Promise<string> {
  const fields: Record<string, unknown> = {
    TITLE: params.title,
    RESPONSIBLE_ID: params.responsible_id,
    PRIORITY: params.priority,
  };
  if (params.description !== undefined) fields.DESCRIPTION = params.description;
  if (params.deadline !== undefined) fields.DEADLINE = params.deadline;
  if (params.group_id !== undefined) fields.GROUP_ID = params.group_id;

  const result = await bitrix24Call("tasks.task.add", { fields });
  return JSON.stringify(result, null, 2);
}
