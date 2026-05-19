import { z } from "zod";
import { AvitoClient } from "../client.js";

const client = new AvitoClient();

export const getItemInfoSchema = z.object({
  item_id: z
    .number()
    .int()
    .positive()
    .describe("ID объявления Avito (число)"),
  user_id: z
    .number()
    .int()
    .positive()
    .optional()
    .describe(
      "Avito user_id владельца объявления. Если не указан — берётся из env AVITO_USER_ID.",
    ),
});

export async function handleGetItemInfo(
  params: z.infer<typeof getItemInfoSchema>,
): Promise<string> {
  const userId = client.resolveUserId(params.user_id);
  // GET /core/v1/accounts/{user_id}/items/{item_id}/
  // Source: developers.avito.ru → Items API → getItemInfo.
  const result = await client.request(
    "GET",
    `/core/v1/accounts/${userId}/items/${params.item_id}/`,
  );
  return JSON.stringify(result, null, 2);
}
