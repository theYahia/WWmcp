import { z } from "zod";
import { hfGet } from "../client.js";
import { curateList, KEYS, listOutputSchema } from "../format.js";
import { HFAccount } from "../types.js";

export const listAccountsSchema = z.object({
  raw: z.boolean().optional().describe("Вернуть полный сырой ответ без курирования"),
});

export const listAccountsOutput = listOutputSchema(HFAccount);

export async function handleListAccounts(
  params: z.infer<typeof listAccountsSchema> = {},
): Promise<Record<string, unknown>> {
  const result = await hfGet(`/accounts`);
  return curateList(result, KEYS.account, params.raw);
}
