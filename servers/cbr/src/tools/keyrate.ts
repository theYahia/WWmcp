import { z } from "zod";
import { getKeyRate, getKeyRateHistory } from "../client.js";
import { isoDateOptional } from "./common.js";

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
  from_date: isoDateOptional("Начало периода YYYY-MM-DD (по умолчанию год назад)"),
  to_date: isoDateOptional("Конец периода YYYY-MM-DD (по умолчанию сегодня)"),
});

export async function handleGetKeyRateHistory(params: z.infer<typeof getKeyRateHistorySchema>): Promise<string> {
  const changes = await getKeyRateHistory(params.from_date, params.to_date);

  return JSON.stringify(
    {
      description: "История изменений ключевой ставки ЦБ РФ (точки изменения, новые первыми)",
      count: changes.length,
      changes: changes.map((c) => ({ effective_from: c.date, rate_percent: c.rate })),
    },
    null,
    2,
  );
}
