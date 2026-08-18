import { z } from "zod";
import { planfixPost, planfixGet } from "../client.js";
import { formatProjectList, formatSingleProject } from "../format.js";

const PROJECT_FIELDS = "id,name,description,status";

export const getProjectsSchema = z.object({
  offset: z.number().optional().describe("Смещение для пагинации (по умолчанию 0)"),
  pageSize: z.number().optional().describe("Количество проектов на странице (по умолчанию 100)"),
  fields: z.string().optional().describe(`Список полей через запятую (по умолчанию: ${PROJECT_FIELDS})`),
});

export async function handleGetProjects(params: z.infer<typeof getProjectsSchema>): Promise<string> {
  const offset = params.offset ?? 0;
  const pageSize = params.pageSize ?? 100;
  // У project/list НЕТ параметра filterId (он только у contacts) — не отправляем.
  const result = await planfixPost("project/list", {
    offset,
    pageSize,
    fields: params.fields ?? PROJECT_FIELDS,
  });
  return formatProjectList(result, pageSize, offset);
}

export const getProjectSchema = z.object({
  projectId: z.number().describe("ID проекта"),
  fields: z.string().optional().describe(`Список полей через запятую (по умолчанию: ${PROJECT_FIELDS})`),
});

export async function handleGetProject(params: z.infer<typeof getProjectSchema>): Promise<string> {
  const result = await planfixGet(`project/${params.projectId}`, { fields: params.fields ?? PROJECT_FIELDS });
  return formatSingleProject(result);
}
