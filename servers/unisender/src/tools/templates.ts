import { z } from "zod";
import { apiCall } from "../client.js";

export const getTemplatesSchema = z.object({
  type: z.enum(["user", "system"]).optional().describe("Тип шаблонов: user или system"),
  limit: z.number().optional().describe("Количество (по умолчанию 50)"),
  offset: z.number().optional().describe("Смещение для пагинации"),
});

export async function handleGetTemplates(params: z.infer<typeof getTemplatesSchema>): Promise<string> {
  const query: Record<string, string> = {};
  if (params.type) query.type = params.type;
  if (params.limit) query.limit = String(params.limit);
  if (params.offset) query.offset = String(params.offset);

  const data = await apiCall("listTemplates", query);
  return JSON.stringify(data, null, 2);
}

export const getTemplateSchema = z.object({
  template_id: z.number().describe("ID шаблона"),
});

export async function handleGetTemplate(params: z.infer<typeof getTemplateSchema>): Promise<string> {
  const data = await apiCall("getTemplate", {
    template_id: String(params.template_id),
  });
  return JSON.stringify(data, null, 2);
}
