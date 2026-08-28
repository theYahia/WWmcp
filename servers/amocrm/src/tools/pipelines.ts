import { z } from "zod";
import { apiGet } from "../client.js";

// --- list_pipelines ---
export const listPipelinesSchema = z.object({});

export async function handleListPipelines(): Promise<string> {
  const data = await apiGet<unknown>("/leads/pipelines");
  return JSON.stringify(data, null, 2);
}
