import { z } from "zod";
import { getPreciousMetals } from "../client.js";
import { isoDateOptional } from "./common.js";

export const getPreciousMetalsSchema = z.object({
  date: isoDateOptional("Дата в формате YYYY-MM-DD (по умолчанию последние данные)"),
});

export async function handleGetPreciousMetals(params: z.infer<typeof getPreciousMetalsSchema>): Promise<string> {
  const metals = await getPreciousMetals(params.date);

  if (metals.length === 0) {
    return JSON.stringify(
      { message: "Нет данных о драгоценных металлах за указанную дату. Попробуйте другую дату (рабочий день)." },
      null,
      2,
    );
  }

  return JSON.stringify(
    {
      description: "Учётные цены ЦБ РФ на драгоценные металлы (руб. за грамм)",
      metals,
    },
    null,
    2,
  );
}
