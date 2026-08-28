import { z } from "zod";
import { saluteGet } from "../client.js";

export const getTaskStatusSchema = z.object({
  task_id: z.string().describe("Task ID returned from async recognition request"),
});

export async function handleGetTaskStatus(params: z.infer<typeof getTaskStatusSchema>): Promise<string> {
  const response = await saluteGet(`/task:get?id=${encodeURIComponent(params.task_id)}`);
  const result = await response.json();
  return JSON.stringify(result, null, 2);
}
