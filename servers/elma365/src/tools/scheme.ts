import { z } from "zod";
import { elmaRequest } from "../client.js";
import { formatResult } from "./_shared.js";

// Discovery-инструменты: позволяют агенту узнать реальные namespace / коды приложений / коды полей,
// вместо того чтобы угадывать их. Рекомендуется вызывать ПЕРЕД чтением/записью элементов.

// --- list_namespaces: разделы (namespaces) системы ---
// Официально: GET /scheme/namespaces.
export const listNamespacesSchema = z.object({});

export async function handleListNamespaces(_params: z.infer<typeof listNamespacesSchema>): Promise<string> {
  const result = await elmaRequest("GET", "scheme/namespaces");
  return formatResult(result);
}

// --- list_apps: приложения внутри раздела ---
// Официально: GET /scheme/namespaces/{namespace}/apps.
export const listAppsSchema = z.object({
  namespace: z.string().min(1).describe("Пространство имён раздела (namespace)"),
});

export async function handleListApps(params: z.infer<typeof listAppsSchema>): Promise<string> {
  const result = await elmaRequest("GET", `scheme/namespaces/${params.namespace}/apps`);
  return formatResult(result);
}

// --- get_app_schema: схема приложения (коды и типы полей) ---
// Официально: GET /scheme/namespaces/{namespace}/apps/{code}.
export const getAppSchemaSchema = z.object({
  namespace: z.string().min(1).describe("Пространство имён раздела (namespace)"),
  code: z.string().min(1).describe("Код приложения"),
});

export async function handleGetAppSchema(params: z.infer<typeof getAppSchemaSchema>): Promise<string> {
  const result = await elmaRequest("GET", `scheme/namespaces/${params.namespace}/apps/${params.code}`);
  return formatResult(result);
}
