import { z } from "zod";
import { PochtaClient } from "../client.js";
import { asRecord, pick, asNumber } from "../lib.js";

export const deliveryTimeSchema = z.object({
  from_index: z.string().regex(/^\d{6}$/).describe("Индекс отправителя (6 цифр)"),
  to_index: z.string().regex(/^\d{6}$/).describe("Индекс получателя (6 цифр)"),
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
});

let _client: PochtaClient;
function client() {
  return (_client ??= new PochtaClient());
}

export async function handleDeliveryTime(params: z.infer<typeof deliveryTimeSchema>): Promise<string> {
  // Authed otpravka delivery endpoint (otpravka-api.pochta.ru/1.0/delivery).
  // [VERIFY endpoint existence + response shape against official spec — the
  //  tariff endpoint also returns a delivery-time block if /delivery is unavailable.]
  const result = await client().post<Record<string, unknown>>("/delivery", {
    "index-from": params.from_index,
    "index-to": params.to_index,
    "mail-type": params.mail_type,
    "mail-category": params.mail_category,
  });

  const delivery = asRecord(pick(result, "delivery", "delivery-time", "delivery_time"));

  return JSON.stringify(
    {
      откуда: params.from_index,
      куда: params.to_index,
      тип: params.mail_type,
      срок_мин_дней: asNumber(
        pick(delivery, "min", "min-days", "min_days") ??
          pick(result, "delivery-time-min", "delivery_time_min"),
      ),
      срок_макс_дней: asNumber(
        pick(delivery, "max", "max-days", "max_days") ??
          pick(result, "delivery-time-max", "delivery_time_max"),
      ),
    },
    null,
    2,
  );
}
