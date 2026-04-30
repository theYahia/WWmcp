import { BaseHttpClient, NoAuthStrategy, createLogger } from "@theyahia/mcp-core";
import type { UzRate } from "./types.js";

const logger = createLogger("cbu-mcp");

const client = new BaseHttpClient({
  baseUrl: "https://cbu.uz/ru/arkhiv-kursov-valyut/json",
  timeout: 10_000,
  maxRetries: 3,
  auth: new NoAuthStrategy(),
  logger,
});

export async function fetchRates(date?: string, currency?: string): Promise<UzRate[]> {
  let path = "/";

  if (currency && date) {
    path = `/${currency.toUpperCase()}/${date}/`;
  } else if (currency) {
    path = `/${currency.toUpperCase()}/`;
  } else if (date) {
    path = `/all/${date}/`;
  }

  return (await client.get(path)) as UzRate[];
}
