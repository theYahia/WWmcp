import { z } from "zod";
import { PochtaClient, HOSTS } from "../client.js";
import { asRecord, pick, asString } from "../lib.js";

export const zipLookupSchema = z.object({
  postal_code: z.string().regex(/^\d{6}$/).describe("Почтовый индекс (6 цифр)"),
});

let _client: PochtaClient;
function client() {
  return (_client ??= new PochtaClient());
}

/** Read a field from top level or a nested `address` object. */
function field(o: Record<string, unknown>, ...keys: string[]): unknown {
  return pick(o, ...keys) ?? pick(asRecord(o.address), ...keys);
}

export async function handleZipLookup(params: z.infer<typeof zipLookupSchema>): Promise<string> {
  // Routed via HOSTS.postoffice (sibling of /1.0) — fixes the old doubled "/1.0/postoffice/1.0".
  const result = await client().get<Record<string, unknown>>(
    `/${params.postal_code}`,
    undefined,
    { host: HOSTS.postoffice },
  );

  // [VERIFY response field names against official spec — kebab/snake both tolerated]
  return JSON.stringify(
    {
      индекс: asString(pick(result, "postal-code", "postal_code", "index")) ?? params.postal_code,
      регион: asString(field(result, "region")),
      район: asString(field(result, "area")),
      населённый_пункт: asString(field(result, "place", "settlement")),
      адрес: asString(field(result, "location", "address-source", "address_source")),
      тип_отделения: asString(pick(result, "type-code", "type_code")),
      график: asString(field(result, "work-time", "work_time", "working-hours")),
    },
    null,
    2,
  );
}
