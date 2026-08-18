import { z } from "zod";
import { hfGet } from "../client.js";
import { curateList, KEYS, listOutputSchema } from "../format.js";
import { HFStage } from "../types.js";

export const listStagesSchema = z.object({
  account_id: z.coerce.number().describe("ID аккаунта HuntFlow"),
  raw: z.boolean().optional().describe("Вернуть полный сырой ответ без курирования"),
});

export const listStagesOutput = listOutputSchema(HFStage);

export async function handleListStages(
  params: z.infer<typeof listStagesSchema>,
): Promise<Record<string, unknown>> {
  // Путь v2: /vacancies/statuses (множественное число).
  const result = await hfGet(`/accounts/${params.account_id}/vacancies/statuses`);
  return curateList(result, KEYS.stage, params.raw);
}
