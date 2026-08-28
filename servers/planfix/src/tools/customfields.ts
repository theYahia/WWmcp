import { z } from "zod";
import { planfixGet } from "../client.js";
import { formatCustomFieldList } from "../format.js";

// Кастомные поля перечисляются по типу объекта: GET /customfield/{objectType}.
export const listCustomFieldsSchema = z.object({
  objectType: z
    .enum(["task", "contact", "project", "user", "main"])
    .describe("Тип объекта, для которого нужны кастомные поля"),
});

export async function handleListCustomFields(params: z.infer<typeof listCustomFieldsSchema>): Promise<string> {
  const result = await planfixGet(`customfield/${params.objectType}`);
  return formatCustomFieldList(result);
}
