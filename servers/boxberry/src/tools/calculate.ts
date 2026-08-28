import { z } from "zod";
import { BoxberryClient } from "../client.js";
import type { BoxberryDeliveryCalc } from "../types.js";

const client = new BoxberryClient();

export const calcDeliverySchema = z.object({
  target: z.string().describe("Код пункта выдачи назначения Boxberry"),
  weight: z.number().positive().describe("Вес отправления в граммах"),
  order_sum: z.number().default(0).describe("Сумма заказа в копейках (для расчёта страховки)"),
  delivery_sum: z.number().default(0).describe("Сумма доставки в копейках (для наложенного платежа)"),
  pay_sum: z.number().default(0).describe("Сумма наложенного платежа в копейках"),
  height: z.number().optional().describe("Высота в см"),
  width: z.number().optional().describe("Ширина в см"),
  depth: z.number().optional().describe("Глубина в см"),
});

export async function handleCalcDelivery(params: z.infer<typeof calcDeliverySchema>): Promise<string> {
  const reqParams: Record<string, string> = {
    target: params.target,
    weight: String(params.weight),
    ordersum: String(params.order_sum),
    deliverysum: String(params.delivery_sum),
    paysum: String(params.pay_sum),
  };
  if (params.height) reqParams.height = String(params.height);
  if (params.width) reqParams.width = String(params.width);
  if (params.depth) reqParams.depth = String(params.depth);

  const result = (await client.call("DeliveryCosts", reqParams)) as BoxberryDeliveryCalc;

  return JSON.stringify({
    стоимость_доставки: result.price,
    базовая_стоимость: result.price_base,
    стоимость_услуг: result.price_service,
    срок_дней: result.delivery_period,
  }, null, 2);
}
