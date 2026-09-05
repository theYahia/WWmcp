import { z } from "zod";
import { megaplanGet } from "../client.js";
import { buildListQuery, idSchema } from "../query.js";
import { formatList, formatEntity, formatProgram } from "../format.js";

// Deal programs (a.k.a. pipelines). create_deal requires a program_id, and this
// is the only way to discover it.

export const getDealProgramsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(25).describe("Results per page (max 100)"),
  page_after: z.string().optional().describe("Cursor: id of the last program from the previous page"),
  raw: z.boolean().optional().describe("Return raw API JSON instead of a compact summary"),
});

export async function handleGetDealPrograms(
  params: z.infer<typeof getDealProgramsSchema>,
): Promise<string> {
  const query = buildListQuery({ entity: "Program", limit: params.limit, pageAfter: params.page_after });
  const result = await megaplanGet("/program", query);
  return formatList(result, formatProgram, params.raw);
}

export const getDealProgramSchema = z.object({
  id: idSchema.describe("Deal program (pipeline) ID"),
  raw: z.boolean().optional().describe("Return raw API JSON instead of a compact summary"),
});

export async function handleGetDealProgram(
  params: z.infer<typeof getDealProgramSchema>,
): Promise<string> {
  const result = await megaplanGet(`/program/${params.id}`);
  return formatEntity(result, formatProgram, params.raw);
}
