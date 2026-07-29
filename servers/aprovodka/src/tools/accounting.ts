import { z } from "zod";
import { oneCGet, buildODataPath } from "../client.js";

// ──────────────────────────────────────────────────────────────
// get_accounting_register — записи регистра бухгалтерии
// (AccountingRegister_*, например Хозрасчетный — проводки)
// ──────────────────────────────────────────────────────────────

export const getAccountingRegisterSchema = z.object({
  register_name: z
    .string()
    .default("Хозрасчетный")
    .describe("Имя регистра бухгалтерии (по умолчанию Хозрасчетный — основной план счетов)"),
  filter: z
    .string()
    .optional()
    .describe("OData $filter (например, Period ge datetime'2024-01-01T00:00:00')"),
  select: z.string().optional().describe("OData $select"),
  top: z.number().int().min(1).max(5000).default(100).describe("$top"),
  skip: z.number().int().min(0).default(0).describe("$skip"),
  orderby: z.string().optional().describe("OData $orderby (например, Period desc)"),
});

export async function handleGetAccountingRegister(
  params: z.infer<typeof getAccountingRegisterSchema>,
): Promise<string> {
  const query: Record<string, string> = {
    $format: "json",
    $top: String(params.top),
  };
  if (params.skip) query["$skip"] = String(params.skip);
  if (params.filter) query["$filter"] = params.filter;
  if (params.select) query["$select"] = params.select;
  if (params.orderby) query["$orderby"] = params.orderby;

  const path = buildODataPath(`AccountingRegister_${params.register_name}`, query);
  const result = await oneCGet(path);
  return JSON.stringify(result, null, 2);
}
