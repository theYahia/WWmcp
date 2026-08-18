import { z } from "zod";
import { planfixPost } from "../client.js";
import { formatDatatagList } from "../format.js";

const DATATAG_FIELDS = "id,name";

export const listDatatagsSchema = z.object({
  offset: z.number().optional().describe("Смещение для пагинации (по умолчанию 0)"),
  pageSize: z.number().optional().describe("Количество дата-тегов на странице (по умолчанию 100)"),
  fields: z.string().optional().describe(`Список полей через запятую (по умолчанию: ${DATATAG_FIELDS})`),
});

export async function handleListDatatags(params: z.infer<typeof listDatatagsSchema>): Promise<string> {
  const result = await planfixPost("datatag/list", {
    offset: params.offset ?? 0,
    pageSize: params.pageSize ?? 100,
    fields: params.fields ?? DATATAG_FIELDS,
  });
  return formatDatatagList(result);
}
