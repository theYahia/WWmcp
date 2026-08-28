import { z } from "zod";
import { planfixPost, planfixGet } from "../client.js";
import { formatTaskList, formatSingleTask, formatCreated, formatUpdated } from "../format.js";

// Без явного `fields` Planfix возвращает почти пустые (id-only) объекты,
// поэтому всегда запрашиваем осмысленный набор полей.
const TASK_FIELDS = "id,name,description,status,priority,assignees,project,startDateTime,endDateTime";

// Ad-hoc фильтр Planfix: { type, operator, value } (комбинируются по AND).
const filterSchema = z.object({
  type: z.number().describe("Тип фильтра (числовой код Planfix, напр. 8 — имя, 51 — шаблон)"),
  operator: z.string().describe("Оператор сравнения, напр. 'equal', 'gt', 'lt'"),
  value: z.unknown().describe("Значение фильтра"),
});

export const getTasksSchema = z.object({
  offset: z.number().optional().describe("Смещение для пагинации (по умолчанию 0)"),
  pageSize: z.number().optional().describe("Количество задач на странице (по умолчанию 100)"),
  filterId: z.union([z.string(), z.number()]).optional().describe("ID сохранённого фильтра задач (см. /task/filters)"),
  filters: z.array(filterSchema).optional().describe("Массив ad-hoc фильтров для произвольной фильтрации"),
  fields: z.string().optional().describe(`Список полей через запятую (по умолчанию: ${TASK_FIELDS})`),
});

export async function handleGetTasks(params: z.infer<typeof getTasksSchema>): Promise<string> {
  const offset = params.offset ?? 0;
  const pageSize = params.pageSize ?? 100;
  const result = await planfixPost("task/list", {
    offset,
    pageSize,
    fields: params.fields ?? TASK_FIELDS,
    ...(params.filterId !== undefined ? { filterId: String(params.filterId) } : {}),
    ...(params.filters ? { filters: params.filters } : {}),
  });
  return formatTaskList(result, pageSize, offset);
}

export const getTaskSchema = z.object({
  taskId: z.number().describe("ID задачи"),
  fields: z.string().optional().describe(`Список полей через запятую (по умолчанию: ${TASK_FIELDS})`),
});

export async function handleGetTask(params: z.infer<typeof getTaskSchema>): Promise<string> {
  const result = await planfixGet(`task/${params.taskId}`, { fields: params.fields ?? TASK_FIELDS });
  return formatSingleTask(result);
}

export const createTaskSchema = z.object({
  name: z.string().describe("Название задачи"),
  description: z.string().optional().describe("Описание задачи"),
  projectId: z.number().optional().describe("ID проекта"),
  assigneeId: z.number().optional().describe("ID исполнителя (сотрудника). Найти ID: инструмент list_users"),
  // ВНИМАНИЕ: priority — строка, но точные допустимые значения не верифицированы
  // против live API. Передаётся как есть.
  priority: z.string().optional().describe("Приоритет задачи (строка). Допустимые значения не верифицированы против live API"),
});

export async function handleCreateTask(params: z.infer<typeof createTaskSchema>): Promise<string> {
  const body: Record<string, unknown> = { name: params.name };
  if (params.description) body.description = params.description;
  if (params.projectId) body.project = { id: params.projectId };
  // Planfix ждёт PeopleRequest: { users: [{ id: "user:<N>" }] }, id — строка с префиксом.
  if (params.assigneeId) body.assignees = { users: [{ id: `user:${params.assigneeId}` }] };
  if (params.priority) body.priority = params.priority;

  const result = await planfixPost("task/", body);
  return formatCreated("Задача", result);
}

export const updateTaskSchema = z.object({
  taskId: z.number().describe("ID задачи"),
  name: z.string().optional().describe("Новое название"),
  description: z.string().optional().describe("Новое описание"),
  status: z.number().optional().describe("ID нового статуса"),
  assigneeId: z.number().optional().describe("ID нового исполнителя (см. list_users)"),
});

export async function handleUpdateTask(params: z.infer<typeof updateTaskSchema>): Promise<string> {
  const body: Record<string, unknown> = {};
  if (params.name) body.name = params.name;
  if (params.description) body.description = params.description;
  if (params.status) body.status = { id: params.status };
  if (params.assigneeId) body.assignees = { users: [{ id: `user:${params.assigneeId}` }] };

  // Planfix возвращает пустое тело (200 — применено, 202 — поставлено в очередь);
  // подтверждение формируем из taskId.
  await planfixPost(`task/${params.taskId}`, body);
  return formatUpdated("Задача", params.taskId);
}
