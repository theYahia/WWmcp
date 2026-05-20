import { z } from "zod";
import { AvitoClient } from "../client.js";

const client = new AvitoClient();

export const getItemsStatsSchema = z.object({
  item_ids: z
    .array(z.number().int().positive())
    .min(1)
    .max(200)
    .describe(
      "Массив ID объявлений для запроса статистики (1-200 за раз). Источник IDs — list_my_items.",
    ),
  date_from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "ISO date YYYY-MM-DD")
    .describe(
      "Начальная дата окна статистики (YYYY-MM-DD). Максимум 270 дней назад.",
    ),
  date_to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "ISO date YYYY-MM-DD")
    .describe("Конечная дата окна статистики (YYYY-MM-DD)."),
  fields: z
    .array(
      z.enum([
        "uniqViews",
        "uniqContacts",
        "uniqFavorites",
        "views",
        "contacts",
        "favorites",
      ]),
    )
    .default(["uniqViews", "uniqContacts", "uniqFavorites"])
    .describe(
      "Поля статистики для возврата. По умолчанию unique просмотры/контакты/избранное.",
    ),
  period_grouping: z
    .enum(["day", "week", "month"])
    .default("day")
    .describe("Группировка периода: day (по умолчанию), week, month."),
  user_id: z
    .number()
    .int()
    .positive()
    .optional()
    .describe(
      "Avito user_id владельца объявлений. Если не указан — берётся из env AVITO_USER_ID.",
    ),
});

export async function handleGetItemsStats(
  params: z.infer<typeof getItemsStatsSchema>,
): Promise<string> {
  const userId = client.resolveUserId(params.user_id);
  // POST /stats/v1/accounts/{user_id}/items
  // Body: { dateFrom, dateTo, fields[], itemIds[], periodGrouping }
  // Source: developers.avito.ru → Stats API → getItemStats.
  const body = {
    dateFrom: params.date_from,
    dateTo: params.date_to,
    fields: params.fields,
    itemIds: params.item_ids,
    periodGrouping: params.period_grouping,
  };
  const result = await client.request(
    "POST",
    `/stats/v1/accounts/${userId}/items`,
    body,
  );
  return JSON.stringify(result, null, 2);
}
