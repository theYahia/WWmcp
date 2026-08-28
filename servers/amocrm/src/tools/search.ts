import { z } from "zod";
import { apiGet } from "../client.js";

// --- search ---
export const searchSchema = z.object({
  query: z.string().min(3).describe("Search query (min 3 characters). Searches across leads, contacts, and companies."),
  limit: z.number().max(250).optional().describe("Max results (default 50, max 250)"),
});

export async function handleSearch(params: z.infer<typeof searchSchema>): Promise<string> {
  const qp: Record<string, string> = { query: params.query };
  if (params.limit) qp["limit"] = String(params.limit);

  const data = await apiGet<unknown>("/search", qp);
  return JSON.stringify(data, null, 2);
}
