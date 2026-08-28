import { z } from "zod";
import { planfixPost, planfixGet } from "../client.js";
import { formatFile, formatCreated } from "../format.js";

// FileUploadRequest = { name, url } (оба опциональны). Загрузка файла по ссылке —
// без multipart. Прямую загрузку с диска (POST /file/) тут не реализуем.
export const uploadFileFromUrlSchema = z.object({
  url: z.string().describe("Прямая ссылка на файл для загрузки"),
  name: z.string().optional().describe("Имя файла (если не задано — берётся из ссылки)"),
});

export async function handleUploadFileFromUrl(params: z.infer<typeof uploadFileFromUrlSchema>): Promise<string> {
  const body: Record<string, unknown> = { url: params.url };
  if (params.name) body.name = params.name;
  const result = await planfixPost("file/from-url/", body);
  return formatCreated("Файл", result);
}

export const getFileSchema = z.object({
  fileId: z.number().describe("ID файла"),
});

export async function handleGetFile(params: z.infer<typeof getFileSchema>): Promise<string> {
  const result = await planfixGet(`file/${params.fileId}`);
  return formatFile(result);
}
