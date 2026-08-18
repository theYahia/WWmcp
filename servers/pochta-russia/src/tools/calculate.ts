import { z } from "zod";
import { PochtaClient } from "../client.js";
import { asRecord, pick, asNumber, asString } from "../lib.js";

export const calculateSchema = z.object({
  from_index: z.string().regex(/^\d{6}$/).describe("Почтовый индекс отправителя (6 цифр)"),
  to_index: z.string().regex(/^\d{6}$/).describe("Почтовый индекс получателя (6 цифр)"),
  weight: z.number().int().positive().max(50000).describe("Вес отправления в граммах (до 50000)"),
  mail_type: z
    .enum([
      "POSTAL_PARCEL",
      "ONLINE_PARCEL",
      "ONLINE_COURIER",
      "EMS",
      "EMS_OPTIMAL",
      "LETTER",
      "BANDEROL",
      "BUSINESS_COURIER",
      "BUSINESS_COURIER_ES",
    ])
    .default("POSTAL_PARCEL")
    .describe("Тип отправления"),
  mail_category: z
    .enum([
      "SIMPLE",
      "ORDERED",
      "ORDINARY",
      "WITH_DECLARED_VALUE",
      "WITH_DECLARED_VALUE_AND_CASH_ON_DELIVERY",
      "WITH_COMPULSORY_PAYMENT",
    ])
    .default("SIMPLE")
    .describe("Категория отправления"),
  declared_value: z.number().int().nonnegative().optional().describe("Объявленная ценность в копейках"),
  dimension_type: z.enum(["S", "M", "L", "XL", "OVERSIZED"]).optional().describe("Типоразмер"),
});

let _client: PochtaClient;
function client() {
  return (_client ??= new PochtaClient());
}

export async function handleCalculate(params: z.infer<typeof calculateSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    "index-from": params.from_index,
    "index-to": params.to_index,
    "mail-category": params.mail_category,
    "mail-type": params.mail_type,
    mass: params.weight,
  };
  if (params.declared_value !== undefined) body["declared-value"] = params.declared_value;
  if (params.dimension_type) body["dimension-type"] = params.dimension_type;

  // Authed otpravka tariff endpoint (otpravka-api.pochta.ru/1.0/tariff).
  const result = await client().post<Record<string, unknown>>("/tariff", body);

  // [VERIFY field names against TariffAPI spec — both kebab/snake tolerated]
  const ground = asRecord(pick(result, "ground-rate", "ground_rate"));
  const deliveryTime = asRecord(pick(result, "delivery-time", "delivery_time"));

  return JSON.stringify(
    {
      стоимость_всего_коп: asNumber(pick(result, "total-rate", "total_rate")),
      ндс_коп: asNumber(pick(result, "total-nds", "total_nds")),
      наземная_пересылка: ground
        ? {
            стоимость_коп: asNumber(pick(ground, "rate")),
            ндс_коп: asNumber(pick(ground, "vat")),
          }
        : null,
      срок_доставки: deliveryTime
        ? {
            мин_дней: asNumber(pick(deliveryTime, "min-days", "min_days", "min")),
            макс_дней: asNumber(pick(deliveryTime, "max-days", "max_days", "max")),
          }
        : null,
      примечание: asString(pick(result, "notice")),
    },
    null,
    2,
  );
}
