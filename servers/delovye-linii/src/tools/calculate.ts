import { z } from "zod";
import { DellinClient } from "../client.js";
import type { DellinCalcResult } from "../types.js";

let client: DellinClient;
function getClient() { return client ??= new DellinClient(); }

export const calculateSchema = z.object({
  derival_city_id: z.number().describe("ID города отправления (из get_cities)"),
  arrival_city_id: z.number().describe("ID города назначения (из get_cities)"),
  weight: z.number().positive().describe("Вес груза в кг"),
  length: z.number().positive().optional().describe("Длина в м"),
  width: z.number().positive().optional().describe("Ширина в м"),
  height: z.number().positive().optional().describe("Высота в м"),
  quantity: z.number().int().positive().default(1).describe("Количество мест"),
});

export async function handleCalculate(params: z.infer<typeof calculateSchema>): Promise<string> {
  const cargo: Record<string, unknown> = {
    weight: params.weight,
    quantity: params.quantity,
  };
  if (params.length) cargo.length = params.length;
  if (params.width) cargo.width = params.width;
  if (params.height) cargo.height = params.height;

  const result = (await getClient().post("/calculator", {
    delivery: {
      derival: { city: { cityID: params.derival_city_id } },
      arrival: { city: { cityID: params.arrival_city_id } },
    },
    cargo,
  })) as DellinCalcResult;

  if (!result.data) {
    return "Не удалось рассчитать стоимость. Проверьте параметры.";
  }

  const d = result.data;
  const variants: Record<string, unknown>[] = [];

  if (d.intercity) {
    variants.push({
      тип: "Межгород (автодоставка)",
      стоимость: d.intercity.price,
      срок_от_дней: d.intercity.delivery_time_from,
      срок_до_дней: d.intercity.delivery_time_to,
    });
  }
  if (d.small_cargo) {
    variants.push({
      тип: "Малогабаритный груз",
      стоимость: d.small_cargo.price,
      срок_от_дней: d.small_cargo.delivery_time_from,
      срок_до_дней: d.small_cargo.delivery_time_to,
    });
  }
  if (d.air) {
    variants.push({
      тип: "Авиадоставка",
      стоимость: d.air.price,
      срок_от_дней: d.air.delivery_time_from,
      срок_до_дней: d.air.delivery_time_to,
    });
  }
  if (d.express) {
    variants.push({
      тип: "Экспресс",
      стоимость: d.express.price,
      срок_от_дней: d.express.delivery_time_from,
      срок_до_дней: d.express.delivery_time_to,
    });
  }

  if (variants.length === 0) {
    return JSON.stringify({ общая_стоимость: d.price }, null, 2);
  }

  return JSON.stringify({ общая_стоимость: d.price, варианты: variants }, null, 2);
}
