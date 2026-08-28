import { z } from "zod";
import { PochtaClient, HOSTS } from "../client.js";
import { asRecord, pick, asString, asNumber } from "../lib.js";

export const getOfficesSchema = z.object({
  postal_code: z.string().optional().describe("Почтовый индекс для поиска конкретного отделения"),
  settlement: z.string().optional().describe("Населённый пункт для поиска отделений"),
  region: z.string().optional().describe("Регион для фильтрации"),
  top: z.number().int().min(1).max(100).default(20).describe("Количество результатов"),
});

let _client: PochtaClient;
function client() {
  return (_client ??= new PochtaClient());
}

/** Read a field from the office object, looking at top level and inside a nested `address` object. */
function field(o: Record<string, unknown>, ...keys: string[]): unknown {
  return pick(o, ...keys) ?? pick(asRecord(o.address), ...keys);
}

/** Compose a human-readable address from whatever the API returned. [VERIFY response shape against spec] */
function officeAddress(o: Record<string, unknown>): string | null {
  const full = asString(pick(o, "address-source", "address_source"));
  if (full) return full;
  const parts = [
    field(o, "region"),
    field(o, "area"),
    field(o, "place", "settlement"),
    field(o, "location"),
  ]
    .map(asString)
    .filter((x): x is string => !!x);
  return parts.length ? parts.join(", ") : null;
}

function normalizeOffice(o: Record<string, unknown>, fallbackCode?: string) {
  return {
    индекс: asString(pick(o, "postal-code", "postal_code", "index")) ?? fallbackCode ?? null,
    адрес: officeAddress(o),
    широта: asNumber(field(o, "latitude")),
    долгота: asNumber(field(o, "longitude")),
    график: asString(field(o, "work-time", "work_time", "working-hours")),
  };
}

export async function handleGetOffices(params: z.infer<typeof getOfficesSchema>): Promise<string> {
  // postoffice API base is a SIBLING of /1.0 (otpravka-api.pochta.ru/postoffice/1.0),
  // routed via HOSTS.postoffice to avoid the doubled "/1.0/postoffice/1.0" path.
  if (params.postal_code) {
    const result = await client().get<Record<string, unknown>>(
      `/${params.postal_code}`,
      undefined,
      { host: HOSTS.postoffice },
    );
    const office = normalizeOffice(result, params.postal_code);
    const phones = (pick(result, "phones") as unknown[] | undefined)?.map((p) =>
      asString(pick(asRecord(p), "phone-number", "phone_number")),
    );
    return JSON.stringify({ ...office, телефоны: phones ?? null }, null, 2);
  }

  const query: Record<string, string | undefined> = {
    settlement: params.settlement,
    region: params.region,
    top: String(params.top),
  };

  const result = await client().get<unknown>("/nearby", query, { host: HOSTS.postoffice });

  if (!Array.isArray(result) || result.length === 0) {
    return "Отделения не найдены по заданным параметрам.";
  }

  return JSON.stringify(
    result.map((o) => normalizeOffice(asRecord(o) ?? {})),
    null,
    2,
  );
}
