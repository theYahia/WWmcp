import { z } from "zod";
import { BoxberryClient } from "../client.js";
import type { BoxberryPoint } from "../types.js";

const client = new BoxberryClient();

export const listPointsSchema = z.object({
  city_code: z.string().describe("Код города Boxberry (из list_cities)"),
  prepaid: z.enum(["0", "1"]).default("0").describe("Только с предоплатой: 0=все, 1=только предоплата"),
});

export async function handleListPoints(params: z.infer<typeof listPointsSchema>): Promise<string> {
  const result = (await client.call("ListPoints", {
    CityCode: params.city_code,
    prepaid: params.prepaid,
  })) as BoxberryPoint[];

  if (!Array.isArray(result) || result.length === 0) {
    return "Пункты выдачи не найдены для указанного города.";
  }

  const limited = result.slice(0, 50);
  return JSON.stringify(limited.map(p => ({
    код: p.Code,
    название: p.Name,
    адрес: p.Address,
    телефон: p.Phone,
    график: p.WorkSchedule,
    срок_дней: p.DeliveryPeriod,
    город: p.CityName,
    gps: p.GPS,
  })), null, 2);
}
