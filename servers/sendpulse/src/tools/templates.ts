import { z } from "zod";
import { apiGet, apiPost } from "../client.js";

export const listTemplatesSchema = z.object({
  owner: z.enum(["me", "sendpulse"]).optional().describe("Фильтр: me — свои шаблоны, sendpulse — системные"),
});

export async function handleListTemplates(params: z.infer<typeof listTemplatesSchema>): Promise<string> {
  const owner = params.owner ?? "me";
  const data = await apiGet(`/templates?owner=${owner}`);
  return JSON.stringify(data, null, 2);
}

export const getTemplateSchema = z.object({
  id: z.number().describe("ID шаблона"),
});

export async function handleGetTemplate(params: z.infer<typeof getTemplateSchema>): Promise<string> {
  const data = await apiGet(`/template/${params.id}`);
  return JSON.stringify(data, null, 2);
}
