import { z } from "zod";
import { planfixPost } from "../client.js";
import { formatDirectoryList, formatDirectoryEntryList } from "../format.js";

// Справочники (directories) Planfix хранят, в т.ч., кастомные наборы статусов задач.
const DIRECTORY_FIELDS = "id,name";

export const listDirectoriesSchema = z.object({
  offset: z.number().optional().describe("Смещение для пагинации (по умолчанию 0)"),
  pageSize: z.number().optional().describe("Количество справочников на странице (по умолчанию 100)"),
  fields: z.string().optional().describe(`Список полей через запятую (по умолчанию: ${DIRECTORY_FIELDS})`),
});

export async function handleListDirectories(params: z.infer<typeof listDirectoriesSchema>): Promise<string> {
  const result = await planfixPost("directory/list", {
    offset: params.offset ?? 0,
    pageSize: params.pageSize ?? 100,
    fields: params.fields ?? DIRECTORY_FIELDS,
  });
  return formatDirectoryList(result);
}

export const listDirectoryEntriesSchema = z.object({
  directoryId: z.number().describe("ID справочника (например, набор статусов)"),
  offset: z.number().optional().describe("Смещение для пагинации (по умолчанию 0)"),
  pageSize: z.number().optional().describe("Количество записей на странице (по умолчанию 100)"),
});

export async function handleListDirectoryEntries(params: z.infer<typeof listDirectoryEntriesSchema>): Promise<string> {
  const result = await planfixPost(`directory/${params.directoryId}/entry/list`, {
    offset: params.offset ?? 0,
    pageSize: params.pageSize ?? 100,
  });
  return formatDirectoryEntryList(result);
}
