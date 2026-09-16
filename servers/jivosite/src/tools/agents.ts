import { z } from "zod";
import { jivoGet } from "../client.js";

export const getAgentsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50).describe("Количество агентов"),
});

export async function handleGetAgents(params: z.infer<typeof getAgentsSchema>): Promise<string> {
  const result = await jivoGet("agents", {
    limit: String(params.limit),
  });
  return JSON.stringify(result, null, 2);
}
