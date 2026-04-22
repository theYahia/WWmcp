import { z } from "zod";
import { gcGet } from "../client.js";
import type { GetCourseExportResponse, GetCourseExportResult } from "../types.js";

export const getUsersSchema = z.object({
  status: z.enum(["active", "in_base", "blocked"]).optional().describe("Filter by user status"),
  created_from: z.string().optional().describe("Registration date from (YYYY-MM-DD)"),
  created_to: z.string().optional().describe("Registration date to (YYYY-MM-DD)"),
});

export async function handleGetUsers(params: z.infer<typeof getUsersSchema>): Promise<string> {
  const filters: Record<string, unknown> = {};
  if (params.status) filters.status = params.status;
  if (params.created_from) filters.created_at = { from: params.created_from, to: params.created_to };

  const exportResp = (await gcGet("/account/users", {
    ...(Object.keys(filters).length > 0 ? { filters: JSON.stringify(filters) } : {}),
  })) as GetCourseExportResponse;

  if (!exportResp.success && exportResp.info?.export_id) {
    const exportId = exportResp.info.export_id;
    let attempts = 0;
    while (attempts < 10) {
      await new Promise(r => setTimeout(r, 2000));
      const statusResp = (await gcGet(`/account/exports/${exportId}`)) as GetCourseExportResult;
      if (statusResp.success && statusResp.info?.items) {
        return JSON.stringify(statusResp.info.items.slice(0, 50), null, 2);
      }
      attempts++;
    }
    return "User export is taking too long. Try again later.";
  }

  if (exportResp.success && (exportResp as unknown as GetCourseExportResult).info?.items) {
    const items = ((exportResp as unknown as GetCourseExportResult).info?.items ?? []).slice(0, 50);
    return JSON.stringify(items, null, 2);
  }

  return JSON.stringify(exportResp, null, 2);
}
