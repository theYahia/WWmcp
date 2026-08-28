import { z } from "zod";
import { elmaRequest } from "../client.js";
import { pagingShape, sortExpressionSchema, buildListBody, formatResult } from "./_shared.js";

// --- get_app_items: список элементов приложения с фильтрацией ---
// Официально: POST /app/{namespace}/{code}/list (GET-вариант принимает один JSON-параметр `query`,
// POST-вариант — полноценная фильтрация в теле). Ответ: { success, error, result: { result: [...], total } }.
export const getAppItemsSchema = z.object({
  namespace: z.string().min(1).describe("Пространство имён приложения (namespace / код раздела)"),
  code: z.string().min(1).describe("Код приложения"),
  ...pagingShape,
  active: z.boolean().optional().describe("Только не удалённые элементы"),
  filter: z.record(z.string(), z.unknown()).optional().describe("Фильтр по полям, например {\"status\": \"new\"}"),
  sortExpressions: z.array(sortExpressionSchema).optional().describe("Правила сортировки"),
});

export async function handleGetAppItems(params: z.infer<typeof getAppItemsSchema>): Promise<string> {
  const body = buildListBody({
    from: params.from,
    size: params.size,
    active: params.active,
    filter: params.filter,
    sortExpressions: params.sortExpressions,
  });
  const result = await elmaRequest("POST", `app/${params.namespace}/${params.code}/list`, body);
  return formatResult(result);
}

// --- get_app_item: один элемент по id ---
// Официально: GET /app/{namespace}/{code}/{id}/get (POST-варианта для get-by-id нет).
export const getAppItemSchema = z.object({
  namespace: z.string().min(1).describe("Пространство имён приложения (namespace)"),
  code: z.string().min(1).describe("Код приложения"),
  id: z.string().min(1).describe("ID элемента (UUID)"),
});

export async function handleGetAppItem(params: z.infer<typeof getAppItemSchema>): Promise<string> {
  const result = await elmaRequest("GET", `app/${params.namespace}/${params.code}/${params.id}/get`);
  return formatResult(result);
}

// --- create_item: создание элемента ---
// Официально: POST /app/{namespace}/{code}/create. ВАЖНО: поля обязаны быть в "context", а не на верхнем уровне.
export const createItemSchema = z.object({
  namespace: z.string().min(1).describe("Пространство имён приложения (namespace)"),
  code: z.string().min(1).describe("Код приложения"),
  data: z.record(z.string(), z.unknown()).describe("Поля нового элемента (по кодам полей приложения)"),
  statusGroupId: z.string().optional().describe("ID статуса (опционально)"),
  withEventForceCreate: z.boolean().optional().describe("Принудительно вызвать событие создания (опционально)"),
});

export async function handleCreateItem(params: z.infer<typeof createItemSchema>): Promise<string> {
  const body: Record<string, unknown> = { context: params.data };
  if (params.statusGroupId !== undefined) body.statusGroupId = params.statusGroupId;
  if (params.withEventForceCreate !== undefined) body.withEventForceCreate = params.withEventForceCreate;

  const result = await elmaRequest("POST", `app/${params.namespace}/${params.code}/create`, body);
  return formatResult(result);
}

// --- update_app_item: редактирование элемента ---
// Официально: POST /app/{namespace}/{code}/{id}/update. Поля — также внутри "context".
export const updateAppItemSchema = z.object({
  namespace: z.string().min(1).describe("Пространство имён приложения (namespace)"),
  code: z.string().min(1).describe("Код приложения"),
  id: z.string().min(1).describe("ID элемента (UUID)"),
  data: z.record(z.string(), z.unknown()).describe("Изменяемые поля (по кодам полей приложения)"),
});

export async function handleUpdateAppItem(params: z.infer<typeof updateAppItemSchema>): Promise<string> {
  const result = await elmaRequest(
    "POST",
    `app/${params.namespace}/${params.code}/${params.id}/update`,
    { context: params.data },
  );
  return formatResult(result);
}

// --- set_app_item_status: смена статуса элемента ---
// Официально: POST /app/{namespace}/{code}/{id}/set-status.
export const setAppItemStatusSchema = z.object({
  namespace: z.string().min(1).describe("Пространство имён приложения (namespace)"),
  code: z.string().min(1).describe("Код приложения"),
  id: z.string().min(1).describe("ID элемента (UUID)"),
  status: z.string().min(1).describe("Код нового статуса"),
});

export async function handleSetAppItemStatus(params: z.infer<typeof setAppItemStatusSchema>): Promise<string> {
  const result = await elmaRequest(
    "POST",
    `app/${params.namespace}/${params.code}/${params.id}/set-status`,
    { status: params.status },
  );
  return formatResult(result);
}
