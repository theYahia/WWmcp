import { getKeyRate } from "../client.js";

export async function handleGetKeyRate(): Promise<string> {
  const { rate, date } = await getKeyRate();

  return JSON.stringify(
    {
      key_rate_percent: rate,
      last_change_date: date,
      description: `Ключевая ставка ЦБ РФ: ${rate}% (с ${date})`,
    },
    null,
    2,
  );
}
