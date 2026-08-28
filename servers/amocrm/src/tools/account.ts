import { z } from "zod";
import { apiGet } from "../client.js";

// --- get_account ---
export const getAccountSchema = z.object({
  with: z
    .array(z.enum(["amojo_id", "amojo_rights", "users_groups", "task_types", "version", "datetime_settings"]))
    .optional()
    .describe("Additional data to include: amojo_id, users_groups, task_types, etc."),
});

export async function handleGetAccount(params: z.infer<typeof getAccountSchema>): Promise<string> {
  const qp: Record<string, string> = {};
  if (params.with?.length) qp["with"] = params.with.join(",");
  const data = await apiGet<unknown>("/account", qp);
  return JSON.stringify(data, null, 2);
}
