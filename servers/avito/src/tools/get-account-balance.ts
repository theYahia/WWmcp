import { z } from "zod";
import { AvitoClient } from "../client.js";

const client = new AvitoClient();

export const getAccountBalanceSchema = z.object({
  user_id: z
    .number()
    .int()
    .positive()
    .optional()
    .describe(
      "Avito user_id владельца кошелька. Если не указан — берётся из env AVITO_USER_ID.",
    ),
});

export async function handleGetAccountBalance(
  params: z.infer<typeof getAccountBalanceSchema>,
): Promise<string> {
  const userId = client.resolveUserId(params.user_id);
  // GET /core/v1/accounts/{user_id}/balance/
  // Source: developers.avito.ru → Core API → getBalance.
  // Возвращает { real: number, bonus: number } — реальные деньги и бонусы.
  const result = await client.request(
    "GET",
    `/core/v1/accounts/${userId}/balance/`,
  );
  return JSON.stringify(result, null, 2);
}
