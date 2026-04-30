import { z } from "zod";
import { oneCGet, buildODataPath } from "../client.js";

export const getRegisterSchema = z.object({
  register_type: z.enum(["InformationRegister", "AccumulationRegister"]).describe("Тип регистра"),
  register_name: z.string().describe("Имя регистра (например, ЦеныНоменклатуры)"),
  filter: z.string().optional().describe("OData $filter"),
  select: z.string().optional().describe("OData $select"),
  top: z.number().int().min(1).max(5000).default(100).describe("$top"),
  skip: z.number().int().min(0).default(0).describe("$skip"),
  orderby: z.string().optional().describe("OData $orderby"),
});

export async function handleGetRegister(params: z.infer<typeof getRegisterSchema>): Promise<string> {
  const entity = `${params.register_type}_${params.register_name}`;
  const query: Record<string, string> = {
    $format: "json",
    $top: String(params.top),
  };
  if (params.skip) query["$skip"] = String(params.skip);
  if (params.filter) query["$filter"] = params.filter;
  if (params.select) query["$select"] = params.select;
  if (params.orderby) query["$orderby"] = params.orderby;

  const path = buildODataPath(entity, query);
  const result = await oneCGet(path);
  return JSON.stringify(result, null, 2);
}
