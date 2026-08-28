import { z } from "zod";
import { elmaRequest } from "../client.js";
import { pagingShape, buildListBody, formatResult } from "./_shared.js";

// --- list_processes: шаблоны бизнес-процессов в разделе ---
// Официально: GET /scheme/namespaces/{namespace}/processes. Пути "bpm/process" не существует.
export const listProcessesSchema = z.object({
  namespace: z.string().min(1).describe("Пространство имён раздела (namespace)"),
});

export async function handleListProcesses(params: z.infer<typeof listProcessesSchema>): Promise<string> {
  const result = await elmaRequest("GET", `scheme/namespaces/${params.namespace}/processes`);
  return formatResult(result);
}

// --- get_process_instances: запущенные экземпляры процесса по шаблону ---
// Официально: GET/POST /bpm/instance/bytemplate/{namespace}/{code}/list.
export const getProcessInstancesSchema = z.object({
  namespace: z.string().min(1).describe("Пространство имён раздела (namespace)"),
  code: z.string().min(1).describe("Код шаблона процесса"),
  ...pagingShape,
  active: z.boolean().optional().describe("Только активные экземпляры"),
  filter: z.record(z.string(), z.unknown()).optional().describe("Фильтр по полям экземпляра"),
});

export async function handleGetProcessInstances(params: z.infer<typeof getProcessInstancesSchema>): Promise<string> {
  const body = buildListBody({
    from: params.from,
    size: params.size,
    active: params.active,
    filter: params.filter,
  });
  const result = await elmaRequest(
    "POST",
    `bpm/instance/bytemplate/${params.namespace}/${params.code}/list`,
    body,
  );
  return formatResult(result);
}

// --- start_process: запуск бизнес-процесса ---
// Официально: POST /bpm/template/{namespace}/{code}/run. Требуется namespace + code (раньше был только code).
export const startProcessSchema = z.object({
  namespace: z.string().min(1).describe("Пространство имён раздела (namespace)"),
  code: z.string().min(1).describe("Код бизнес-процесса для запуска"),
  context: z.record(z.string(), z.unknown()).optional().describe("Контекст запуска (входные параметры процесса)"),
});

export async function handleStartProcess(params: z.infer<typeof startProcessSchema>): Promise<string> {
  const body: Record<string, unknown> = {};
  if (params.context !== undefined) body.context = params.context;

  const result = await elmaRequest("POST", `bpm/template/${params.namespace}/${params.code}/run`, body);
  return formatResult(result);
}
