import { z } from "zod";
import { getKeyRate, getKeyRateHistory } from "../client.js";

export async function handleGetKeyRate(): Promise<string> {
  const { rate, date, since } = await getKeyRate();

  return JSON.stringify(
    {
      key_rate_percent: rate,
      as_of: date,
      effective_since: since,
      description: `Ключевая ставка ЦБ РФ: ${rate}% (действует с ${since})`,
    },
    null,
    2,
  );
}

export const getKeyRateHistorySchema = z.object({
  from_date: z
    .string()
    .optional()
    .describe("Начало периода в формате YYYY-MM-DD (по умолчанию год назад)"),
  to_date: z
    .string()
    .optional()
    .describe("Конец периода в формате YYYY-MM-DD (по умолчанию сегодня)"),
});

export async function handleGetKeyRateHistory(
  params: z.infer<typeof getKeyRateHistorySchema>,
): Promise<string> {
  const changes = await getKeyRateHistory(params.from_date, params.to_date);

  return JSON.stringify(
    {
      description:
        "История изменений ключевой ставки ЦБ РФ (точки изменения, новые первыми)",
      count: changes.length,
      changes: changes.map((c) => ({
        effective_from: c.date,
        rate_percent: c.rate,
      })),
    },
    null,
    2,
  );
}
