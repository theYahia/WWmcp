import { z } from "zod";
import { elmaRequest } from "../client.js";
import { pagingShape, buildListBody, formatResult } from "./_shared.js";

// --- get_tasks: список задач пользователя ---
// Официально: GET/POST /tasks/list (+ /income, /outcome, /participate). Пути "bpm/task" не существует.
const taskListKind = z.enum(["all", "income", "outcome", "participate"]).default("all")
  .describe("Какой список: все / входящие / исходящие / в которых участвую");

export const getTasksSchema = z.object({
  ...pagingShape,
  kind: taskListKind,
  closed: z.boolean().optional().describe("Включать завершённые задачи"),
  filter: z.record(z.string(), z.unknown()).optional().describe("Дополнительный фильтр по полям задачи"),
});

export async function handleGetTasks(params: z.infer<typeof getTasksSchema>): Promise<string> {
  const suffix = params.kind === "all" ? "" : `/${params.kind}`;
  const body = buildListBody({
    from: params.from,
    size: params.size,
    closed: params.closed,
    filter: params.filter,
  });
  const result = await elmaRequest("POST", `tasks/list${suffix}`, body);
  return formatResult(result);
}

// --- get_task: одна задача по id ---
// Официально: GET /tasks/{id}/get.
export const getTaskSchema = z.object({
  id: z.string().min(1).describe("ID задачи"),
});

export async function handleGetTask(params: z.infer<typeof getTaskSchema>): Promise<string> {
  const result = await elmaRequest("GET", `tasks/${params.id}/get`);
  return formatResult(result);
}

// --- get_task_exits: доступные исходы (варианты завершения) задачи ---
// Официально: GET /tasks/{id}/exits. Вызывается перед complete_task, чтобы узнать валидный exitId.
export const getTaskExitsSchema = z.object({
  id: z.string().min(1).describe("ID задачи"),
});

export async function handleGetTaskExits(params: z.infer<typeof getTaskExitsSchema>): Promise<string> {
  const result = await elmaRequest("GET", `tasks/${params.id}/exits`);
  return formatResult(result);
}

// --- complete_task: завершение (отправка) задачи ---
// Официально: PUT /tasks/{id}/submit. Ключевое BPM-действие. exitId — из get_task_exits.
export const completeTaskSchema = z.object({
  id: z.string().min(1).describe("ID задачи"),
  exitId: z.string().min(1).describe("ID исхода (из get_task_exits)"),
  instanceId: z.string().min(1).describe("ID экземпляра процесса задачи"),
  context: z.record(z.string(), z.unknown()).optional().describe("Значения полей формы при завершении (опционально)"),
});

export async function handleCompleteTask(params: z.infer<typeof completeTaskSchema>): Promise<string> {
  const body: Record<string, unknown> = { exitId: params.exitId, instanceId: params.instanceId };
  if (params.context !== undefined) body.context = params.context;

  const result = await elmaRequest("PUT", `tasks/${params.id}/submit`, body);
  return formatResult(result);
}

// --- reassign_task: переназначение задачи другому исполнителю ---
// Официально: POST /tasks/{id}/reassign.
export const reassignTaskSchema = z.object({
  id: z.string().min(1).describe("ID задачи"),
  userId: z.string().min(1).describe("ID нового исполнителя"),
});

export async function handleReassignTask(params: z.infer<typeof reassignTaskSchema>): Promise<string> {
  const result = await elmaRequest("POST", `tasks/${params.id}/reassign`, { userId: params.userId });
  return formatResult(result);
}
