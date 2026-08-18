import { z } from "zod";
import { hhGet, HhApiError } from "../client.js";
import type { Area } from "../types.js";
import { flattenAreaTree } from "../format.js";

const rawFlag = z
  .boolean()
  .optional()
  .describe("Return the full raw hh.ru JSON instead of the compact id — name listing.");

const rawOnly = z.object({ raw: rawFlag });

// --- Areas ---

export const getAreasSchema = rawOnly;

export async function handleGetAreas(
  params: z.infer<typeof getAreasSchema> = {},
): Promise<string> {
  const result = await hhGet("/areas");
  if (params.raw) return JSON.stringify(result, null, 2);
  return flattenAreaTree(result as Area[]);
}

export const getAreasSubtreeSchema = z.object({
  area_id: z
    .string()
    .regex(/^\d+$/, "area_id must be a numeric hh.ru id")
    .describe(
      "Country/region id to fetch the subtree for (e.g. 113=Russia, 1=Moscow). Lighter than the full /areas tree.",
    ),
  raw: rawFlag,
});

export async function handleGetAreasSubtree(
  params: z.infer<typeof getAreasSubtreeSchema>,
): Promise<string> {
  const result = await hhGet(`/areas/${encodeURIComponent(params.area_id)}`);
  if (params.raw) return JSON.stringify(result, null, 2);
  // /areas/{id} returns a single Area node with nested areas.
  return flattenAreaTree([result as Area]);
}

// --- Professional Roles ---

export const getProfessionalRolesSchema = rawOnly;

interface RoleCategory {
  id: string;
  name: string;
  roles?: { id: string; name: string }[];
}

export async function handleGetProfessionalRoles(
  params: z.infer<typeof getProfessionalRolesSchema> = {},
): Promise<string> {
  const result = (await hhGet("/professional_roles")) as { categories?: RoleCategory[] };
  if (params.raw) return JSON.stringify(result, null, 2);
  const cats = result.categories ?? [];
  return cats
    .map((c) => {
      const roles = (c.roles ?? []).map((r) => `  ${r.id} — ${r.name}`).join("\n");
      return `${c.id} — ${c.name}${roles ? "\n" + roles : ""}`;
    })
    .join("\n");
}

// --- Industries ---

export const getIndustriesSchema = rawOnly;

interface IndustryGroup {
  id: string;
  name: string;
  industries?: { id: string; name: string }[];
}

export async function handleGetIndustries(
  params: z.infer<typeof getIndustriesSchema> = {},
): Promise<string> {
  const result = (await hhGet("/industries")) as IndustryGroup[];
  if (params.raw) return JSON.stringify(result, null, 2);
  return result
    .map((g) => {
      const sub = (g.industries ?? []).map((i) => `  ${i.id} — ${i.name}`).join("\n");
      return `${g.id} — ${g.name}${sub ? "\n" + sub : ""}`;
    })
    .join("\n");
}

// --- Metro ---

export const getMetroSchema = z.object({
  city_id: z
    .string()
    .regex(/^\d+$/, "city_id must be a numeric hh.ru area id")
    .optional()
    .describe("City area id (e.g. 1=Moscow, 2=Saint Petersburg). Omit to list metro for all cities."),
});

export async function handleGetMetro(
  params: z.infer<typeof getMetroSchema>,
): Promise<string> {
  const path = params.city_id ? `/metro/${encodeURIComponent(params.city_id)}` : "/metro";
  const result = await hhGet(path);
  return JSON.stringify(result, null, 2);
}

// --- Dictionaries ---

export async function handleGetDictionaries(): Promise<string> {
  const result = await hhGet("/dictionaries");
  return JSON.stringify(result, null, 2);
}

// --- Current user / token validation ---

interface MeProfile {
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  is_admin?: boolean;
  is_applicant?: boolean;
  is_employer?: boolean;
  is_application?: boolean;
}

export const validateTokenSchema = z.object({
  raw: z.boolean().optional().describe("Return the raw /me JSON instead of the summary."),
});

export async function handleValidateToken(
  params: z.infer<typeof validateTokenSchema> = {},
): Promise<string> {
  if (!process.env.HH_ACCESS_TOKEN) {
    return "HH_ACCESS_TOKEN не задан. Доступны только публичные endpoint'ы (вакансии, работодатели, зарплаты, словари). Поиск резюме недоступен — нужен employer-токен.";
  }
  try {
    const me = (await hhGet("/me")) as MeProfile;
    if (params.raw) return JSON.stringify(me, null, 2);
    const name =
      [me.first_name, me.last_name].filter(Boolean).join(" ") || me.email || me.id || "—";
    const roles =
      [me.is_employer && "employer", me.is_applicant && "applicant", me.is_admin && "admin"]
        .filter(Boolean)
        .join(", ") || "—";
    const note = me.is_employer
      ? "Роль employer есть — поиск резюме доступен при наличии платной подписки на базу резюме."
      : "Поиск резюме недоступен: нужен employer-токен + платная подписка на базу резюме.";
    return `Токен валиден. Пользователь: ${name}${me.email ? ` <${me.email}>` : ""}. Роли: ${roles}.\n${note}`;
  } catch (e) {
    if (e instanceof HhApiError && (e.status === 401 || e.status === 403)) {
      return `Токен задан, но недействителен или истёк (HTTP ${e.status}). Получите новый OAuth-токен на https://dev.hh.ru/admin.`;
    }
    throw e;
  }
}

// --- Suggests ---

interface SuggestResponse {
  items?: { id?: string; text?: string }[];
}

function formatSuggests(result: unknown): string {
  const items = (result as SuggestResponse).items ?? [];
  if (!items.length) return "(нет совпадений)";
  return items.map((i) => `${i.text}${i.id != null ? ` (id=${i.id})` : ""}`).join("\n");
}

export const suggestPositionsSchema = z.object({
  text: z.string().describe("Partial job title to autocomplete"),
  raw: rawFlag,
});

export async function handleSuggestPositions(
  params: z.infer<typeof suggestPositionsSchema>,
): Promise<string> {
  const query = new URLSearchParams();
  query.set("text", params.text);
  const result = await hhGet(`/suggests/professional_roles?${query.toString()}`);
  if (params.raw) return JSON.stringify(result, null, 2);
  return formatSuggests(result);
}

export const suggestCompaniesSchema = z.object({
  text: z.string().describe("Partial company name to autocomplete"),
  raw: rawFlag,
});

export async function handleSuggestCompanies(
  params: z.infer<typeof suggestCompaniesSchema>,
): Promise<string> {
  const query = new URLSearchParams();
  query.set("text", params.text);
  const result = await hhGet(`/suggests/companies?${query.toString()}`);
  if (params.raw) return JSON.stringify(result, null, 2);
  return formatSuggests(result);
}

export const suggestAreasSchema = z.object({
  text: z.string().describe("Partial region/city name to autocomplete"),
  raw: rawFlag,
});

export async function handleSuggestAreas(
  params: z.infer<typeof suggestAreasSchema>,
): Promise<string> {
  const query = new URLSearchParams();
  query.set("text", params.text);
  const result = await hhGet(`/suggests/areas?${query.toString()}`);
  if (params.raw) return JSON.stringify(result, null, 2);
  return formatSuggests(result);
}
