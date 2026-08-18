import { z } from "zod";
import { BoxberryClient } from "../client.js";

const client = new BoxberryClient();

export const listServicesSchema = z.object({
  tracking_number: z.string().describe("Трек-номер отправления для получения списка оказанных услуг"),
});

export async function handleListServices(params: z.infer<typeof listServicesSchema>): Promise<string> {
  const result = (await client.call("ListServices", {
    ImId: params.tracking_number,
  })) as Array<{ Name: string; Sum: string; Date: string; PaymentMethod: string }>;

  if (!Array.isArray(result) || result.length === 0) {
    return `Услуги по отправлению ${params.tracking_number} не найдены.`;
  }

  return JSON.stringify({
    трек_номер: params.tracking_number,
    услуги: result.map(s => ({
      название: s.Name,
      сумма: s.Sum,
      дата: s.Date,
      способ_оплаты: s.PaymentMethod,
    })),
  }, null, 2);
}
