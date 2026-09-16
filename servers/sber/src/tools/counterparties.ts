import { z } from "zod";
import { sberFetch } from "../client.js";

// --- list_counterparties ---
// Список сохранённых контрагентов (получателей платежей).
// VERIFY: путь эндпоинта зависит от версии СберБизнес API — при необходимости переопределите
// SBER_BASE_URL и сверьтесь с вашим интеграционным договором.
export const listCounterpartiesSchema = z.object({});

export async function handleListCounterparties(): Promise<string> {
  const result = await sberFetch("/fintech/v1/counterparties");
  return JSON.stringify(result, null, 2);
}
