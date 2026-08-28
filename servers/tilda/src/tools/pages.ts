import { z } from "zod";
import { tildaGet } from "../client.js";
import type { TildaProject, TildaPage, TildaPageFull } from "../types.js";

const projectId = z.string().min(1, "ID проекта не может быть пустым").describe("ID проекта Tilda");
const pageId = z.string().min(1, "ID страницы не может быть пустым").describe("ID страницы Tilda");
const metadataOnly = z
  .boolean()
  .optional()
  .describe("Если true — вернуть только метаданные страницы без html/css/js (экономит контекст)");

/** Replace the heavy html/css/js fields with short summaries to keep responses small. */
function toMetadata(result: unknown): unknown {
  if (!result || typeof result !== "object" || Array.isArray(result)) return result;
  const out = { ...(result as Record<string, unknown>) };
  const summarize = (v: unknown): string =>
    typeof v === "string" ? `${v.length} символов (опущено)` :
    Array.isArray(v) ? `${v.length} элементов (опущено)` :
    "присутствует (опущено)";
  for (const key of ["html", "css", "js"] as const) {
    if (key in out && out[key] != null) {
      out[`${key}_info`] = summarize(out[key]);
      delete out[key];
    }
  }
  return out;
}

function render(result: unknown, metadataOnlyFlag?: boolean): string {
  return JSON.stringify(metadataOnlyFlag ? toMetadata(result) : result, null, 2);
}

// --- get_projects ---
export const getProjectsSchema = z.object({});

export async function handleGetProjects(_params: z.infer<typeof getProjectsSchema>): Promise<string> {
  const result = await tildaGet<TildaProject[]>("getprojectslist");
  return JSON.stringify(result, null, 2);
}

// --- get_project_info ---
export const getProjectInfoSchema = z.object({
  projectid: projectId,
  webconfig: z
    .enum(["htaccess", "nginx"])
    .optional()
    .describe("Опционально: вернуть пример конфигурации веб-сервера (htaccess или nginx) для самостоятельного хостинга"),
});

export async function handleGetProjectInfo(params: z.infer<typeof getProjectInfoSchema>): Promise<string> {
  const apiParams: Record<string, string> = { projectid: params.projectid };
  if (params.webconfig) apiParams.webconfig = params.webconfig;
  const result = await tildaGet<TildaProject>("getprojectinfo", apiParams);
  return JSON.stringify(result, null, 2);
}

// --- get_pages ---
export const getPagesSchema = z.object({
  projectid: projectId,
});

export async function handleGetPages(params: z.infer<typeof getPagesSchema>): Promise<string> {
  const result = await tildaGet<TildaPage[]>("getpageslist", {
    projectid: params.projectid,
  });
  return JSON.stringify(result, null, 2);
}

// --- get_page (getpagefull): full page HTML incl. <head>, assets on Tilda CDN ---
export const getPageSchema = z.object({
  pageid: pageId,
  metadata_only: metadataOnly,
});

export async function handleGetPage(params: z.infer<typeof getPageSchema>): Promise<string> {
  const result = await tildaGet<TildaPageFull>("getpagefull", {
    pageid: params.pageid,
  });
  return render(result, params.metadata_only);
}

// --- get_page_body (getpage): body HTML only (no <head>), assets on Tilda CDN ---
export const getPageBodySchema = z.object({
  pageid: pageId,
  metadata_only: metadataOnly,
});

export async function handleGetPageBody(params: z.infer<typeof getPageBodySchema>): Promise<string> {
  const result = await tildaGet<TildaPageFull>("getpage", {
    pageid: params.pageid,
  });
  return render(result, params.metadata_only);
}

// --- get_page_export (getpagefullexport): full standalone page with localized assets ---
export const getPageExportSchema = z.object({
  pageid: pageId,
  metadata_only: metadataOnly,
});

export async function handleGetPageExport(params: z.infer<typeof getPageExportSchema>): Promise<string> {
  const result = await tildaGet<TildaPageFull>("getpagefullexport", {
    pageid: params.pageid,
  });
  return render(result, params.metadata_only);
}

// --- get_page_export_body (getpageexport): body-only export with localized assets ---
export const getPageExportBodySchema = z.object({
  pageid: pageId,
  metadata_only: metadataOnly,
});

export async function handleGetPageExportBody(params: z.infer<typeof getPageExportBodySchema>): Promise<string> {
  const result = await tildaGet<TildaPageFull>("getpageexport", {
    pageid: params.pageid,
  });
  return render(result, params.metadata_only);
}
