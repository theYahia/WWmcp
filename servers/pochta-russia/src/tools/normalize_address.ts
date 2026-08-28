import { z } from "zod";
import { PochtaClient } from "../client.js";
import { asRecord, pick, asString } from "../lib.js";

export const normalizeAddressSchema = z.object({
  raw_address: z
    .string()
    .min(1)
    .max(1000)
    .describe("Адрес в свободной форме для нормализации"),
});

let _client: PochtaClient;
function client() {
  return (_client ??= new PochtaClient());
}

export async function handleNormalizeAddress(
  params: z.infer<typeof normalizeAddressSchema>,
): Promise<string> {
  // Authed otpravka address cleaning endpoint (otpravka-api.pochta.ru/1.0/clean/address).
  const result = await client().post<unknown>("/clean/address", [
    { id: "1", "original-address": params.raw_address },
  ]);

  if (!Array.isArray(result) || result.length === 0) {
    return JSON.stringify({ ошибка: "Не удалось нормализовать адрес." });
  }

  const addr = asRecord(result[0]) ?? {};
  // [VERIFY field names against clean API spec — low risk, kebab/snake tolerated]
  return JSON.stringify(
    {
      индекс: asString(pick(addr, "index")),
      регион: asString(pick(addr, "region")),
      район: asString(pick(addr, "area")),
      город: asString(pick(addr, "place")),
      улица: asString(pick(addr, "street")),
      дом: asString(pick(addr, "house")),
      корпус: asString(pick(addr, "corpus", "building")),
      квартира: asString(pick(addr, "room")),
      качество: asString(pick(addr, "quality-code", "quality_code")),
      код_проверки: asString(pick(addr, "validation-code", "validation_code")),
      оригинал: asString(pick(addr, "original-address", "original_address")) ?? params.raw_address,
    },
    null,
    2,
  );
}
