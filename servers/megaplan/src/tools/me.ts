import { z } from "zod";
import { megaplanGet } from "../client.js";
import { formatEntity, formatEmployee } from "../format.js";

// EXPERIMENTAL: the current-user endpoint is not documented for v3.
// GET /api/v3/employee/current is the most likely path; if the account returns
// 404 we surface a helpful message instead of failing opaquely.

export const getCurrentUserSchema = z.object({
  raw: z.boolean().optional().describe("Return raw API JSON instead of a compact summary"),
});

export async function handleGetCurrentUser(
  params: z.infer<typeof getCurrentUserSchema>,
): Promise<string> {
  try {
    const result = await megaplanGet("/employee/current");
    return formatEntity(result, formatEmployee, params.raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // TODO(live-verify): confirm the current-user path on a real account.
    if (/\b40[34]\b/.test(message)) {
      return JSON.stringify(
        {
          error:
            "Current-user endpoint not available on this account. Find your employee id via get_employees and pass it explicitly (e.g. to get_tasks filter_responsible_id).",
        },
        null,
        2,
      );
    }
    throw error;
  }
}
