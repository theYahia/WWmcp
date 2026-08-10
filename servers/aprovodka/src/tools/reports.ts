import { z } from "zod";
import { oneCGet } from "../client.js";

export const getReportSchema = z.object({
  report_url: z.string().describe("Полный относительный путь к отчёту (например, /hs/reports/balance?date=2024-12-31)"),
});

export async function handleGetReport(params: z.infer<typeof getReportSchema>): Promise<string> {
  const result = await oneCGet(params.report_url);
  return JSON.stringify(result, null, 2);
}
